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
  Alert,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { FontAwesome, FontAwesome5, AntDesign } from "@expo/vector-icons";
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
const doneColor = "#ced4da";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState([]);
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
      Alert.alert(
        "오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.",
        `(${error.message})`
      );
    }
  };

  const loadToDos = async () => {
    try {
      const strToDos = await AsyncStorage.getItem(STORAGE_KEY);
      const arrToDos = JSON.parse(strToDos);

      setToDos(arrToDos);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.",
        `(${error.message})`
      );
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = [
      ...toDos,
      { key: Date.now(), text, isWorking, isDone: false },
    ];

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

  const checkToDo = async (index) => {
    const newToDos = [...toDos];

    if (!toDos[index].isDone) {
      const updateToDo = { ...toDos[index], isDone: true };
      newToDos.splice(index, 1);
      newToDos.push(updateToDo);
    } else {
      const updateToDo = { ...toDos[index], isDone: false };
      newToDos.splice(index, 1);
      newToDos.unshift(updateToDo);
    }

    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const toDoItem = ({ item, drag, isActive, index }) => {
    if (loading) {
      return;
    }

    return isWorking === item.isWorking ? (
      <ScaleDecorator>
        <View
          style={{
            ...styles.toDo,
            backgroundColor: item.isDone ? doneColor : black,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
          >
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                checkToDo(index);
              }}
            >
              <AntDesign
                name="checkcircle"
                size={24}
                color={white}
                style={{
                  backgroundColor: item.isDone ? doneColor : white,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                ...styles.toDoTextSection,
                width: item.isDone ? INNER_WIDTH - 80 : INNER_WIDTH - 145,
              }}
            >
              <Text
                style={{
                  ...styles.toDoText,
                  color: item.isDone ? gray : white,
                  textDecorationLine: item.isDone ? "line-through" : "none",
                }}
              >
                {item.text}
              </Text>
            </View>
            {!item.isDone && (
              <TouchableOpacity
                style={styles.grip}
                activeOpacity={0.4}
                onLongPress={drag}
                disabled={isActive}
              >
                <FontAwesome5 name="grip-lines" size={24} color={gripColor} />
              </TouchableOpacity>
            )}
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
            renderItem={toDoItem}
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
  checkbox: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  toDoTextSection: {
    justifyContent: "center",
    paddingVertical: 15,
    paddingLeft: 5,
  },
  toDoText: {
    color: white,
    fontSize: 16,
  },
  grip: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  toDoMenuSection: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: deleteBtn,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: "center",
  },
});
