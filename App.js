import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { FontAwesome } from "@expo/vector-icons";

const { width: innerWidth } = Dimensions.get("window");
const StatusBarHeight =
  Platform.OS === "ios" ? getStatusBarHeight(true) : StatusBar.currentHeight;
const white = "#e7ecef";
const black = "#292f36";
const gray = "#939597";

export default function App() {
  const [isWorking, setIsWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const onWork = useCallback(() => setIsWorking(true), [setIsWorking]);
  const onPlay = useCallback(() => setIsWorking(false), [setIsWorking]);

  const onChangeText = useCallback(
    (value) => {
      setText(value);
    },
    [setText]
  );

  const addToDo = useCallback(() => {
    if (text === "") {
      return;
    }

    setToDos({ ...toDos, [Date.now()]: { text, isWorking } });
    setText("");
  }, [setToDos, toDos, setText, text, isWorking]);

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
              <View style={styles.toDo}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  bounces={false}
                >
                  <View
                    style={styles.toDoTextSection}
                    id={id}
                    activeOpacity={0.8}
                    key={id}
                  >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: StatusBarHeight + 10,
  },
  btnText: {
    color: gray,
    fontSize: 44,
    fontWeight: "700",
  },
  input: {
    backgroundColor: black,
    color: white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 18,
    marginTop: 10,
    marginBottom: 15,
  },
  content: {
    flex: 1,
  },
  toDo: {
    width: innerWidth - 40,
    backgroundColor: black,
    borderRadius: 15,
    marginTop: 5,
    overflow: "hidden",
  },
  toDoTextSection: {
    justifyContent: "center",
    paddingVertical: 15,
    paddingLeft: 20,
    width: innerWidth,
  },
  toDoMenuSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "firebrick",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  toDoText: {
    color: white,
    fontSize: 16,
  },
  toDoMenu: {
    color: white,
  },
});
