//开发测试UI

import {
	ScriptUI
} from "../API/UIAPI.js";
import {
	UIManager
} from "./init.js";
import {
	USFPlayer,
	UUID
} from "../API/API.js";
import { sendLog } from "../logServer/server.js"
import * as mc from "@minecraft/server";

class TestUI extends ScriptUI.ActionFormData {
	static typeId = "developUI";
	constructor() {
		super();
		this.setTitle("测试");
		this.setInformation();
		this.setButtonsArray([{
			buttonDef: {
				text: "log"
			},
			condition: (player) => {
				return true;
			},
			event: (player) => {
				sendTest("hello server");
			}
		}])
	};
	/*static {
		
	}*/
};
mc.system.run(() => {
  UIManager.addUI(TestUI);
});