import {
	ScriptUI
} from "./UIAPI.js";
import {
	IDGenerate
} from "./API.js";
import {
	USFPlayer
} from "./PlayerAPI.js";
import { LZString } from "../libs/lz-string/lz-string.min.js";
import * as mc from "@minecraft/server";

//自定义UI类
export class CustomUI {
	constructor(uiData) {
		this.data = uiData;
		//1: 列表，2: 表单
		this.ui = (uiData.type === 1 ? new ScriptUI.ActionFormData() : new ScriptUI.ModalFormData());
		this.ui.setTitle(uiData.title);
		if (uiData.label) this.ui.setInformation(uiData.label);
		this.ui.setCloseEvents((player) => {
			for (let command of this.data.closeCommands) {
				player.runCommand(command);
			}
		});
		if (uiData.type === 1) {
			for (let button of uiData.buttonArray) {
				button.event = (player) => {
					for (let command of button.commandList) {
						player.runCommand(command);
					}
				};
				this.ui.addButton(button);
			}
		}
	};

	sendToPlayer(player) {
		this.ui.sendToPlayer(player);
	};
	save() {
		let UIList = CustomUI.getCustomUIList();
		for (let index = 0; index < UIList.length; index++) {
			if (UIList[index].id === this.data.id) {
				UIList[index] = this.data;
				CustomUI.setCustomUIList(UIList);
				return;
			}
		};
		UIList.push(this.data);
		CustomUI.setCustomUIList(UIList);
	};
	remove() {
		let UIList = CustomUI.getCustomUIList();
		for (let index = 0; index < UIList.length; index++) {
			if (UIList[index].id === this.data.id) {
				UIList.splice(index, 1);
			}
		};
		CustomUI.setCustomUIList(UIList);
	};
	
	static getStringData(uiData) {
		return LZString.compressToBase64(JSON.stringify(uiData));
	};

	static toData(strUIData) {
		return JSON.parse(LZString.decompressFromBase64(strUIData));
	};
	
	static getCustomUIList() {
		let data = JSON.parse(mc.world.getDynamicProperty("usf:customUI"));
		let uiDataArray = [];
		for (let uiDataStr of data) {
			uiDataArray.push(CustomUI.toData(uiDataStr));
		};
		return uiDataArray;
	};
	
	static setCustomUIList(customUIList) {
		let uiStringDataArray = [];
		for (let index = 0; index < customUIList.length; index++) {
			uiStringDataArray.push(CustomUI.getStringData(customUIList[index]));
		};
		mc.world.setDynamicProperty("usf:customUI", JSON.stringify(uiStringDataArray));
	};
	
	static getCustomUI(id) {
		let data = JSON.parse(mc.world.getDynamicProperty("usf:customUI"));
		for (let uiDataStr of data) {
			let uiData = CustomUI.toData(uiDataStr);
			if (uiData.id === id) {
				return uiData;
			}
		};
		return undefined;
	}
}

//旧代码
/*
function CustomUIIO(mode = 0, UIList = [], id = "") {
	let data = JSON.parse(mc.world.getDynamicProperty("usf:customUI"));
	switch (mode) {
		case 0:
		case "get":
			let uiDataArray = [];
			//mc.world.sendMessage(JSON.stringify(data));
			for (let uiDataStr of data) {
				uiDataArray.push(CustomUI.toData(uiDataStr));
			};
			return uiDataArray;
			break;
		case 1:
		case "set":
			let uiStringDataArray = [];
			for (let index = 0; index < UIList.length; index++) {
				uiStringDataArray.push(CustomUI.getStringData(UIList[index]));
			};
			mc.world.setDynamicProperty("usf:customUI", JSON.stringify(uiStringDataArray));
			break;
		case 2:
			for (let uiDataStr of data) {
				let uiData = CustomUI.toData(uiDataStr);
				if (uiData.id === id) {
					return uiData;
				}
			}
			break;
	}
};
*/