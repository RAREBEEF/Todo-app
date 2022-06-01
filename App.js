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
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";

const { width: INNER_WIDTH } = Dimensions.get("window");
const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? getStatusBarHeight(true) : StatusBar.currentHeight;
const STORAGE_KEY = "@toDos";

const white = "#e7ecef";
const black = "#292f36";
const gray = "#939597";
const gripColor = "#6c757d";
const deleteBtn = "firebrick";

const initialToDos = [
  { key: "FirstIndexWork", isWorking: true, height: 0 },
  { key: "FirstIndexPlay", isWorking: false, height: 0 },
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState(initialToDos);
  const [scrolled, setScrolled] = useState(false);

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
      const arrToDos = JSON.parse(strToDos);

      if (arrToDos.length === 0) {
        setToDos([...initialToDos, ...arrToDos]);
        setLoading(false);

        return;
      }

      setToDos(arrToDos);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = [...toDos, { key: Date.now(), text, isWorking }];

    setToDos(newToDos);
    await saveToDos(newToDos);

    setText("");
  };

  const deleteToDo = async (key) => {
    const newToDos = [];

    toDos.forEach((toDo) => {
      if (toDo.key !== key) {
        newToDos.push(toDo);
      }
    });

    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const renderItem = ({ item, drag, isActive, index }) => {
    if (loading) {
      return;
    }

    return isWorking === item.isWorking ? (
      <ScaleDecorator>
        <View
          style={{
            ...styles.toDo,
            backgroundColor: isActive ? white : black,
          }}
        >
          <TouchableOpacity
            style={styles.grip}
            activeOpacity={0.4}
            onLongPress={drag}
            disabled={isActive}
          >
            <FontAwesome5 name="grip-lines" size={24} color={gripColor} />
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
          >
            <View
              style={{
                ...styles.toDoTextSection,
              }}
            >
              <Text
                style={{ ...styles.toDoText, color: isActive ? black : white }}
              >
                {item.text}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.toDoMenuSection}
              activeOpacity={0.8}
              onPress={() => {
                deleteToDo(item.key);
              }}
            >
              <FontAwesome name="trash-o" size={24} color={white} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScaleDecorator>
    ) : null;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View
        style={{
          ...styles.header,
        }}
      >
        <View style={styles.tab}>
          <TouchableOpacity onPress={onWork}>
            <Text
              style={{ ...styles.btnText, color: isWorking ? black : gray }}
            >
              WORK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPlay}>
            <Text
              style={{ ...styles.btnText, color: isWorking ? gray : black }}
            >
              PLAY
            </Text>
          </TouchableOpacity>
        </View>
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
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={black} size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          <DraggableFlatList
            containerStyle={styles.list}
            data={toDos}
            onDragEnd={({ data }) => {
              setToDos(data);
              saveToDos(data);
            }}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
          />
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
    backgroundColor: "green",
    flex: 1,
    backgroundColor: white,
  },
  header: {
    paddingTop: STATUS_BAR_HEIGHT + 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tab: { flexDirection: "row", justifyContent: "space-between" },
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
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  toDo: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: black,
    borderRadius: 15,
    marginTop: 10,
    overflow: "hidden",
  },
  grip: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 5,
  },
  toDoTextSection: {
    justifyContent: "center",
    paddingVertical: 15,
    paddingLeft: 5,
    width: INNER_WIDTH,
  },
  toDoMenuSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: deleteBtn,
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
