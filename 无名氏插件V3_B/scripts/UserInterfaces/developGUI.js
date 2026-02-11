//开发测试UI

import {
	ScriptUI
} from "../utils/UIAPI.js";
import {
	UIManager
} from "./init.js";
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
				text: "test"
			},
			condition: (player) => {
				return true;
			},
			event: (player) => {
				let player1 = mc.world.getEntity("-622770257903");
				mc.world.sendMessage("1: " + JSON.stringify(player));
				mc.world.sendMessage("2: " + JSON.stringify(player1));
			}
		}])
	};
	/*static {
		
	}*/
};
mc.system.run(() => {
  UIManager.addUI(TestUI);
});