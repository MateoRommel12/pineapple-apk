"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import SuccessAlert from "../components/SuccessAlert";
import { Camera } from "expo-camera";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = "936892739600-c3flf0e3vq29l231pmriigsehm4nqpig.apps.googleusercontent.com";
const IOS_CLIENT_ID = "936892739600-sfisi1vn0nb3uml2htarh0anvcr5ab7v.apps.googleusercontent.com";
const REDIRECT_URI = "com.pineapplesweetness.app:/oauth2redirect";

type User = {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  profileImage?: string | null;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, profileImage?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  requestCameraAccess: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const navigation = useNavigation<AuthNavigationProp>();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    responseType: "token",
    usePKCE: true,
    redirectUri: REDIRECT_URI,
    extraParams: { prompt: "consent" },
  });

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem("@user");
        if (userJSON) setUser(JSON.parse(userJSON));
      } catch (error) {
        console.error("Failed to load user from storage", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      setIsLoading(true);
      setError(null);
      getUserInfo(response.authentication?.accessToken);
    } else if (response?.type === "error") {
      setError(response.error?.message || "Authentication failed");
    }
  }, [response]);

  const requestCameraAccess = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === "granted");
    if (status !== "granted") setError("Camera permission denied");
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await promptAsync();
      if (result.type === "success" && result.authentication?.accessToken) {
        await getUserInfo(result.authentication.accessToken);
      } else {
        throw new Error("Authentication failed or canceled");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (token?: string) => {
    try {
      if (!token) throw new Error("No access token available");
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user info");
      const userInfo = await response.json();
      const newUser = { id: userInfo.id, name: userInfo.name, email: userInfo.email, photoUrl: userInfo.picture };
      await AsyncStorage.setItem("@user", JSON.stringify(newUser));
      setUser(newUser);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement actual email sign in logic with your backend
      const response = await fetch('YOUR_BACKEND_URL/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Invalid credentials');
      
      const userData = await response.json();
      const newUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        photoUrl: userData.photoUrl,
      };
      
      await AsyncStorage.setItem('@user', JSON.stringify(newUser));
      setUser(newUser);
      navigation.navigate('Home');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, profileImage?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement actual email signup logic with your backend
      const response = await fetch('YOUR_BACKEND_URL/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, profileImage }),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      setShowSuccessAlert(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.removeItem('@user');
      setUser(null);
      navigation.navigate('Login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, requestCameraAccess }}>
      {children}
      <SuccessAlert visible={showSuccessAlert} message="Registration successful! Please log in." onClose={() => navigation.navigate("Login")} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
