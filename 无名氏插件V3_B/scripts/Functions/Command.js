import * as mc from "@minecraft/server";
import {
	USFPlayer,
	Log
} from "../API/API.js";
import {
	UIManager
} from "../UserInterfaces/init.js";
import {
	CustomUI
} from "../UserInterfaces/CustomUIGUI.js";

import { sendLog } from "../logServer/server.js"


mc.system.beforeEvents.startup.subscribe((event) => {
	event.customCommandRegistry.registerEnum("usf:manager", ["get_owner", "reset_owner", "item_edit"]);
	event.customCommandRegistry.registerEnum("usf:func", ["cd", "menu", "tp", "open"]);
	event.customCommandRegistry.registerCommand({
		cheatsRequired: false,
		description: "usf管理员指令",
		permissionLevel: 1,
		name: "usf:manager",
		mandatoryParameters: [{
			name: "usf:manager",
			type: "Enum"
		}]
	}, (source, arg) => {
		switch (arg) {
			case "get_owner":
				if (source.sourceType !== "Entity") {
					return {
						message: "发送者非实体",
						status: 1
					}
					break;
				};
				if (source.sourceEntity.typeId !== "minecraft:player") {
					return {
						message: "发送者非玩家",
						status: 1
					}
					break;
				}
				if (mc.world.getDynamicProperty("usf:owner") !== undefined) {
					return {
						message: "设置失败，已有服主",
						status: 1
					}
					break;
				} else {
					mc.world.setDynamicProperty("usf:owner", USFPlayer.getId(source.sourceEntity));
					USFPlayer.opLevel.setLevel(source.sourceEntity, 5);
					return {
						message: "设置成功",
						status: 0
					}
				}
				break;
			case "reset_owner":
				if (source.sourceType === "Server" || USFPlayer.getId(source.sourceEntity) === mc.world.getDynamicProperty("usf:owner")) {
					mc.world.setDynamicProperty("usf:owner", undefined);
					USFPlayer.opLevel.setLevel(source.sourceEntity, 0);
					return {
						message: "已重置服主",
						status: 0
					}
				} else {
					return {
						message: "重置失败",
						status: 1
					}
				}
				break;
			case "item_edit":
				if (source.sourceType !== "Entity") {
					return {
						message: "发送者非实体",
						status: 1
					}
					break;
				};
				if (source.sourceEntity.typeId !== "minecraft:player") {
					return {
						message: "发送者非玩家",
						status: 1
					}
					break;
				};
				new (UIManager.getUI("ItemEditGUI"))(source.sourceEntity).sendToPlayer(source.sourceEntity);
				break;
		}
	});
	event.customCommandRegistry.registerCommand({
		cheatsRequired: false,
		description: "usf指令",
		permissionLevel: 0,
		name: "usf:func",
		mandatoryParameters: [{
			name: "usf:func",
			type: "Enum"
		}],
		optionalParameters: [{
			name: "ui-uuid",
			type: "String"
		}]
	}, (source, arg, ui_uuid) => {
		if (source.sourceType !== "Entity") {
			return {
				message: "发送者非实体",
				status: 1
			}
		};
		if (source.sourceEntity.typeId !== "minecraft:player") {
			return {
				message: "发送者非玩家",
				status: 1
			}
		};
		switch (arg) {
			case "cd":
			case "menu":
				if (source?.sourceEntity) {
					new(UIManager.getUI("mainGUI"))().sendToPlayer(source.sourceEntity);
				}
				break;
			case "open":
				if (source?.sourceEntity.typeId === "minecraft:player") {
					if (ui_uuid?.length >= 36) {
						new CustomUI(CustomUI.getUIFromUUID(ui_uuid)).sendToPlayer(source?.sourceEntity);
					}
				}
				break;
		}
	});
	
	//test
	/*event.customCommandRegistry.registerCommand({
		cheatsRequired: false,
		description: "log-connect",
		permissionLevel: 2,
		name: "usf:log",
		mandatoryParameters: [{
			name: "log",
			type: "String"
		}]
	}, (source, arg) => {
		sendLog(JSON.parse(arg));
	})*/
	
	
});