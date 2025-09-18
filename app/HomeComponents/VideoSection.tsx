import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  View, 
  ActivityIndicator, 
  Dimensions, 
  StyleSheet,
  Text,
  StatusBar,
  Platform
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useVideoPlayer, VideoView } from "expo-video";

const API_URL = "https://app.bmgjewellers.com/api/v1/videos/list";
const BASE_URL = "https://app.bmgjewellers.com";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.95; // Optimized width for better centering
const VIDEO_HEIGHT = SCREEN_HEIGHT * 0.5; // Responsive height based on screen
const BORDER_RADIUS = 12;

interface Video {
  id: string | number;
  video_path: string;
  title?: string;
  description?: string;
}

interface VideoCardProps {
  videoUrl: string;
  isActive: boolean;
  index: number;
}

const VideoCard = React.memo(({ videoUrl, isActive, index }: VideoCardProps) => {
  const playerRef = useRef<any>(null);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    playerRef.current = player;
    player.loop = true;
    player.muted = false; // Allow sound
    player.volume = 0.8;
    
    // Only auto-play the first video initially
    if (index === 0) {
      player.play();
    }
  });

  useEffect(() => {
    if (player) {
      if (isActive) {
        // Small delay to ensure smooth transition
        const timeout = setTimeout(() => {
          player.play();
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        player.pause();
      }
    }
  }, [isActive, player]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    };
  }, []);

  return (
    <View style={styles.videoCard}>
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={true}
          allowsPictureInPicture={false}
          showsControls={false} // Remove all video controls
          contentFit="cover"
          nativeControls={false} // Explicitly disable native controls
        />
        {/* Optional: Add a subtle overlay for better UX */}
        <View style={styles.videoOverlay} />
      </View>
    </View>
  );
});

VideoCard.displayName = 'VideoCard';

const VideoSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}?page=0&pageSize=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setVideos(data);
      } else {
        setError('No videos available');
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSnapToItem = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const renderVideoItem = useCallback(({ item, index }: { item: Video; index: number }) => (
    <VideoCard 
      key={`${item.id || index}-${item.video_path}`}
      videoUrl={`${BASE_URL}${item.video_path}`} 
      isActive={index === activeIndex} 
      index={index}
    />
  ), [activeIndex]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.retryText} onPress={fetchVideos}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // No videos state
  if (!videos || videos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noVideosText}>No videos available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Optional: Add a title */}
      <Text style={styles.sectionTitle}>Featured Videos</Text>
      
      <View style={styles.carouselWrapper}>
        <Carousel
          ref={carouselRef}
          loop={videos.length > 1}
          width={CARD_WIDTH}
          height={VIDEO_HEIGHT}
          data={videos}
          style={styles.carousel}
          defaultIndex={0}
          autoPlay={videos.length > 1}
          autoPlayInterval={6000} // Longer interval for better UX
          scrollAnimationDuration={600}
          onSnapToItem={handleSnapToItem}
          // Enhanced pan gesture settings
          panGestureHandlerProps={{
            activeOffsetX: [-15, 15],
            failOffsetY: [-20, 20],
          }}
          // Smooth spring animation
          withAnimation={{
            type: "spring",
            config: {
              damping: 15,
              stiffness: 200,
              mass: 1,
              restSpeedThreshold: 0.001,
              restDisplacementThreshold: 0.001,
            },
          }}
          renderItem={renderVideoItem}
        />
      </View>

      {/* Video indicators */}
      {videos.length > 1 && (
        <View style={styles.indicatorContainer}>
          {videos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === activeIndex ? '#D4AF37' : '#E0E0E0',
                  width: index === activeIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2C2C2C',
    letterSpacing: 0.5,
  },
  centerContainer: {
    height: VIDEO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS,
    marginHorizontal: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  retryText: {
    fontSize: 14,
    color: '#3498DB',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  noVideosText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  carouselWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carousel: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCard: {
    width: CARD_WIDTH,
    height: VIDEO_HEIGHT,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    // Add shadow for better visual appeal
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    height: 20,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
});

export default VideoSection;