import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: INNER_WIDTH } = Dimensions.get("window");
const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? getStatusBarHeight(true) : StatusBar.currentHeight;
const STORAGE_KEY = "@toDos";

const white = "#e7ecef";
const black = "#292f36";
const gray = "#939597";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const onWork = useCallback(() => setIsWorking(true), [setIsWorking]);
  const onPlay = useCallback(() => setIsWorking(false), [setIsWorking]);

  const onChangeText = (value) => {
    setText(value);
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error(error);
    }
  };

  const loadToDos = async () => {
    try {
      const strToDos = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(strToDos));
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDo = { ...toDos, [Date.now()]: { text, isWorking } };

    setToDos(newToDo);
    await saveToDos(newToDo);

    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onWork}>
          <Text style={{ ...styles.btnText, color: isWorking ? black : gray }}>
            WORK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPlay}>
          <Text style={{ ...styles.btnText, color: isWorking ? gray : black }}>
            PLAY
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={black} size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          <TextInput
            blurOnSubmit={false}
            value={text}
            onChangeText={onChangeText}
            onSubmitEditing={addToDo}
            style={styles.input}
            returnKeyType="done"
            placeholderTextColor={gray}
            placeholder={isWorking ? "Add To Work" : "Add To Play"}
          />
          <ScrollView>
            {Object.keys(toDos).map((id) =>
              toDos[id].isWorking === isWorking ? (
                <View style={styles.toDo} key={id} id={id}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                  >
                    <View style={styles.toDoTextSection} activeOpacity={0.8}>
                      <Text style={styles.toDoText}>{toDos[id].text}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.toDoMenuSection}
                      activeOpacity={0.8}
                    >
                      <FontAwesome name="trash-o" size={24} color={white} />
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              ) : null
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: white,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: STATUS_BAR_HEIGHT + 10,
  },
  btnText: {
    color: gray,
    fontSize: 44,
    fontWeight: "700",
  },
  input: {
    backgroundColor: black,
    color: white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  toDo: {
    width: INNER_WIDTH - 40,
    backgroundColor: black,
    borderRadius: 15,
    marginTop: 5,
    overflow: "hidden",
  },
  toDoTextSection: {
    justifyContent: "center",
    paddingVertical: 15,
    paddingLeft: 20,
    width: INNER_WIDTH,
  },
  toDoMenuSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "firebrick",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: "center",
  },
  toDoText: {
    color: white,
    fontSize: 16,
    paddingRight: 60,
  },
});
