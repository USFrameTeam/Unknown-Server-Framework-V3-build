import {
  ScriptUI
} from "../utils/UIAPI.js";
import {
  UIManager
} from "./init.js";
import {
	USFPlayer
} from "../utils/PlayerAPI.js";
import * as mc from "@minecraft/server";

class ChatSettingGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("聊天设置");
	}
}