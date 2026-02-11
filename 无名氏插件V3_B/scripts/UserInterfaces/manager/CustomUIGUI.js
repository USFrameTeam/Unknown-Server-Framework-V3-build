import {
	ScriptUI
} from "../../utils/UIAPI.js";
import {
	UIManager
} from "../init.js";
import {
	IDGenerate
} from "../../utils/API.js";
import {
	CustomUI
} from "../../utils/CustomUI.js";
import {
  USFPlayer
} from "../../utils/PlayerAPI.js";
import * as mc from "@minecraft/server";



//一级界面
class CustomManagerGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("自定义界面");
		this.setButtonsArray([{
			buttonDef: {
				text: "添加自定义界面"
			},
			event: (player) => {
				new AddCustomUIType().sendToPlayer(player);
			}
		}]);
		let UIList = CustomUI.getCustomUIList(0);
		for (let buttonData of UIList) {
			this.addButton({
				buttonDef: {
					text: buttonData.title
				},
				event: (player) => {
					if (buttonData.type === 1) {
						new CustomListUIEdit(buttonData).sendToPlayer(player);
					}
				}
			});
		};
		this.setBeforeSendEvents((player, ui)=>{
			ui.setFather(new (UIManager.getUI("ManagerGUI"))(player));
		})
	};
	static typeId = "CustomManagerGUI";
};
mc.system.run(() => {
	UIManager.addUI(CustomManagerGUI);
});



class AddCustomUIType extends ScriptUI.ModalFormData {
	constructor(title = "", warn = null) {
		super();
		this.setTitle(`添加自定义界面`);
		this.setFather(new CustomManagerGUI());
		this.setButtonsArray([{
				typeId: "dropdown",
				id: "ui_type",
				label: "界面类型",
				setting: {
					items: ["列表", "表单（没做，不知道怎么写信息处理方式）"]
				}
			},
			{
				typeId: "textField",
				id: "ui_title",
				label: "名称" + (warn === null ? "" : "\n" + warn),
				setting: {
					defaultValue: title
				}
			}
		]);
		this.setEvents((player, res) => {
			if (res.get("ui_type") === 0) {
				if (res.get("ui_title").includes("|")) {
					new AddCustomUIType(res.get("ui_title"), "名称不能含“ | ”").sendToPlayer(player);
					return;
				};
				let UIList = CustomUI.getCustomUIList();
				let IDList = [];
				for(let customUI of UIList){
					IDList.push(customUI.id);
				};
				new CustomListUIOptions({
					type: 1,
					title: res.get("ui_title"),
					label: "",
					buttonArray: [],
					closeCommands: [],
					id: IDGenerate(IDList)
				}).sendToPlayer(player);
			}
		});
	}
};

class CommandAfterCloseUI extends ScriptUI.ModalFormData {
	constructor(uiData) {
		super();
		let commandIndex = 1;
		this.setTitle("关闭UI后运行指令");
		for (let command of uiData.closeCommands) {
			this.addButton({
				typeId: "textField",
				label: "指令-" + commandIndex,
				id: "command-" + commandIndex,
				setting: {
					defaultValue: command
				}
			});
			commandIndex++;
		};
		this.addButton({
			typeId: "toggle",
			label: "添加指令",
			id: "addCommand",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "清除空指令行",
			id: "clear",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "保存",
			id: "save",
			setting: {}
		});
		this.setEvents((player, result) => {
			let commands = [];
			for (let commandResIndex = 1; commandResIndex < commandIndex; commandResIndex++) {
				let command = result.get("command-" + commandResIndex);
				if (result.get("clear") && command.length === 0) continue;
				commands.push(command);
			};
			if (result.get("addCommand")) {
				commands.push("");
			};
			uiData.closeCommands = commands;
			if (result.get("save")) {
				switch (uiData.type) {
					case 1:
						new CustomListUIOptions(uiData).sendToPlayer(player);
						break;
				}
			} else {
				new CommandAfterCloseUI(uiData).sendToPlayer(player);
			}
		});
	}
}

//-----------------------------------
//列表UI
/*
	listUI:
	{
		type: 1,
		title: String,
		label: String,
		id: String,
		buttons: <button extends ScriptUI.ActionFormData.button>[] {
			commandList: []
		}>
		closeCommands: commandList[]
	}
*/

class CustomListUIOptions extends ScriptUI.ActionFormData {
	constructor(uiData = {
		type: 1,
		title: "",
		label: "",
		buttonArray: [],
		closeCommands: [],
		id: undefined
	}) {
		super();
		this.setTitle("自定义列表UI");
		this.setFather(new CustomListUIEdit(uiData));
		for (let uiIndex = 0; uiIndex < uiData.buttonArray.length; uiIndex++) {
			let buttonCopy = {
				...(uiData.buttonArray[uiIndex])
			};
			buttonCopy.event = (player) => {
				new CustomListUIButtonEdit(uiData, uiIndex).sendToPlayer(player);
			}
			this.addButton(buttonCopy);
		};
		this.addButton({
			buttonDef: {
				text: "添加按钮"
			},
			event: (player) => {
				uiData.buttonArray.push({
					buttonDef: {
						text: "按钮"
					},
					event: (player) => {
						for (let command of this.commandList) {
							player.runCommand(command);
						}
					},
					commandList: []
				});
				new CustomListUIOptions(uiData).sendToPlayer(player);
			}
		});
		this.addButton({
			buttonDef: {
				text: "关闭后运行指令"
			},
			event: (player) => {
				new CommandAfterCloseUI(uiData).sendToPlayer(player);
			}
		});
		this.addButton({
			buttonDef: {
				text: "保存"
			},
			event: (player) => {
				new CustomListUIEdit(uiData).sendToPlayer(player);
			}
		});
	};
};

class CustomListUIButtonEdit extends ScriptUI.ModalFormData {
	constructor(uiData, buttonIndex) {
		super();
		this.setTitle("编辑UI");
		this.setFather(new CustomListUIOptions(uiData));
		let commandIndex = 1;
		this.addButton({
			typeId: "textField",
			label: "按钮名称",
			id: "button_name",
			setting: {
				defaultValue: uiData.buttonArray[buttonIndex].buttonDef.text
			}
		});
		for (let command of uiData.buttonArray[buttonIndex].commandList) {
			this.addButton({
				typeId: "textField",
				label: "指令-" + commandIndex,
				id: "command-" + commandIndex,
				setting: {
					defaultValue: command
				}
			});
			commandIndex++;
		};
		this.addButton({
			typeId: "toggle",
			label: "添加指令",
			id: "addCommand",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "清除空指令行",
			id: "clear",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "保存",
			id: "save",
			setting: {}
		});
		this.addButton({
			typeId: "toggle",
			label: "删除按钮",
			id: "delete",
			setting: {}
		});
		this.setEvents((player, result) => {
			uiData.buttonArray[buttonIndex].buttonDef.text = result.get("button_name");
			delete uiData.buttonArray[buttonIndex].commandList;
			let commands = [];
			for (let commandResIndex = 1; commandResIndex < commandIndex; commandResIndex++) {
				let command = result.get("command-" + commandResIndex);
				if (result.get("clear") && command.length === 0) continue;
				commands.push(command);
			};
			uiData.buttonArray[buttonIndex].commandList = commands;
			if (result.get("addCommand")) {
				uiData.buttonArray[buttonIndex].commandList.push("");
			};
			if (result.get("delete")) {
				uiData.buttonArray.splice(buttonIndex, 1);
				new CustomListUIOptions(uiData).sendToPlayer(player);
				return;
			};
			if (result.get("save")) {
				new CustomListUIOptions(uiData).sendToPlayer(player);
			} else {
				new CustomListUIButtonEdit(uiData, buttonIndex).sendToPlayer(player);
			}
		})
	}
};

class CustomListUIEdit extends ScriptUI.ModalFormData {
	constructor(uiData) {
		super();
		this.setTitle("编辑自定义列表");
		//this.setInformation(`id: ${uiData.id}`);
		this.setButtonsArray([{
				typeId: "textField",
				label: "列表名称",
				id: "ui_name",
				setting: {
					defaultValue: uiData.title
				}
			},
			{
				typeId: "textField",
				label: "id（复制）",
				id: "ui_id_copy",
				setting: {
					defaultValue: uiData.id
				}
			},
			/*{
				type: "dropdown"
			},*/
			{
				typeId: "toggle",
				label: "编辑内容及关闭事件",
				id: "button_edit",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				label: "保存",
				id: "save",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				label: "删除",
				id: "delete",
				setting: {
					defaultValue: false
				}
			}
		]);
		this.setEvents((player, res) => {
			uiData.title = res.get("ui_name");
			if (res.get("delete")) {
				new CustomUI(uiData).remove();
				return;
			};
			if (res.get("save")) {
				new CustomUI(uiData).save();
				return;
			};
			if (res.get("button_edit")) {
				new CustomListUIOptions(uiData).sendToPlayer(player);
			};
		});
	}
}

//--------------------------------------

//表格UI