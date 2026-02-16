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

class TeamGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("团队设置");
		this.addButton({
			buttonDef: {
				text: "添加团队"
			}
		})
	};
}