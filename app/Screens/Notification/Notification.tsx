import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { View, SafeAreaView, LayoutAnimation } from "react-native";
import Header from "../../layout/Header";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import SwipeBox from "../../components/SwipeBox";
import { getNotifications, Notification as NotificationType } from "./GetNotificationService";
import { IMAGES } from "../../constants/Images";

const Notification = () => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNotifications();

      const mappedData = data.map((item: NotificationType) => ({
        id: item.Id,
        image: item.ImageUrl ? { uri: item.ImageUrl } : IMAGES.small3,
        title: item.Title,
        message: item.Message,
        date: new Date(item.SentAt).toLocaleDateString(),
        sentAt: new Date(item.SentAt).getTime(),
      }));

      // ✅ remove duplicates (same title + message)
      const uniqueData = mappedData.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) => t.title === item.title && t.message === item.message
          )
      );

      // ✅ sort by latest SentAt (descending)
      uniqueData.sort((a, b) => b.sentAt - a.sentAt);

      setLists(uniqueData);
    };

    fetchData();
  }, []);

  const deleteItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    const arr = [...lists];
    arr.splice(index, 1);
    setLists(arr);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
      <Header
        title={`Notifications (${lists.length})`}
        leftIcon={"back"}
        rightIcon2={"search"}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: 5, paddingBottom: 5 }}>
            {lists.map((data, index) => (
              <SwipeBox
                key={data.id || index}
                data={data}
                theme={theme}
                colors={colors}
                handleDelete={() => deleteItem(index)}
              />
            ))}
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default Notification;
