import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, Pressable } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/AuthProvider';

export default function TabLayout() {
  const [showOptions, setShowOptions] = useState(false);
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();

  const OptionsMenu = () => (
    <>
      <Pressable 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
        onPress={() => setShowOptions(false)}
      />
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        padding: 20,
        paddingBottom: 30,
        zIndex: 1000,
      }}>
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            marginBottom: 8,
          }}
          onPress={() => {
            console.log('Hesap değiştir');
            setShowOptions(false);
          }}
        >
          <Feather 
            name="user-plus" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
          <ThemedText style={{ marginLeft: 12, fontSize: 16 }}>Hesap Değiştir</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
          }}
          onPress={() => {
            signOut();
            setShowOptions(false);
          }}
        >
          <Feather 
            name="log-out" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
          <ThemedText style={{ marginLeft: 12, fontSize: 16 }}>Çıkış Yap</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Keşfet',
            tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Paylaş',
            tabBarIcon: ({ color }) => <Feather name="plus-square" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Ayarlar',
            tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
            tabBarButton: (props: any) => (
              <TouchableOpacity
                onLongPress={() => setShowOptions(true)}
                onPress={() => {}}
                style={props.style}
              >
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs>
      {showOptions && <OptionsMenu />}
    </>
  );
}
