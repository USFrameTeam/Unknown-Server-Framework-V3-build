import {
	ScriptUI
} from "../../API/UIAPI.js";
import {
	UIManager
} from "../init.js";
import * as mc from "@minecraft/server";

class ItemEditGUI extends ScriptUI.ModalFormData {
	static typeId = "ItemEditGUI";
	constructor(player, items) {
		super();
		let equipItemComp = player.getComponent("minecraft:equippable");
		let item = equipItemComp.getEquipment("Mainhand");
		if (!item) {
			return;
		};
		if (items) {
			item = items.itemStack;
			//方块id不正确等错误获取
			try {
				switch (items.mode) {
					case 1:
						item.setCanPlaceOn(items.items);
						break;
					case 2:
						item.setCanDestroy(items.items);
						break;
					case 3:
						item.setLore(items.items);
						break;
				}
			} catch (error) {
				if(items.mode === 3)return;
				let unavaiableBlockID = [];
				for(let blockIDIndex = 0; blockIDIndex < items.items.length; blockIDIndex++){
					if(!mc.EntityTypes.get(items.items[blockIDIndex])){
						unavaiableBlockID.push(items.items[blockIDIndex]);
						items.items.splice(blockIDIndex, 1);
					}
				};
				switch (items.mode) {
					case 1:
						item.setCanPlaceOn(items.items);
						break;
					case 2:
						item.setCanDestroy(items.items);
						break;
				};
				player.sendMessage("error：不可用方块列表：" + JSON.stringify(unavaiableBlockID));
				//USFAPI("error：不可用方块列表：" + JSON.stringify(unavaiableBlockID));
			};
		}
		this.setTitle("物品编辑");
		this.setButtonsArray([{
				typeId: "textField",
				label: "物品名称",
				id: "item_name",
				setting: {
					defaultValue: (item.nameTag ? item.nameTag : item.localizationKey)
				}
			},
			{
				typeId: "dropdown",
				label: "物品锁定",
				id: "item_lock_mode",
				setting: {
					items: ["无", "无法丢弃、用于合成", "无法丢弃、用于合成、改变位置"],
					defaultValue: (item.lockMode === "inventory" ? 1 : (item.lockMode === "none" ? 0 : 2))
				}
			},
			{
				typeId: "toggle",
				label: "死亡不掉落",
				id: "item_keep_on_death",
				setting: {
					defaultValue: item.keepOnDeath
				}
			},
			{
				typeId: "dropdown",
				label: "编辑（第二、三个选项方块id要正确）",
				id: "item_editOptions",
				setting: {
					items: ["无", "可放置在方块上（仅对可放置物品生效）", "可用于破坏方块", "物品面板展示数据"],
					defaultValue: 0
				}
			},
			{
				typeId: "toggle",
				label: "生成掉落物（在脚下一格生成）",
				id: "item_drop",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				label: "保存（若“编辑”非“无”则不生效）",
				id: "item_save",
				setting: {
					defaultValue: false
				}
			}
		]);
		this.setEvents((player, result) => {
			if (result.get("item_name") === item.localizationKey) {
				item.nameTag = undefined;
			} else {
				item.nameTag = result.get("item_name");
			};
			item.lockMode = (result.get("item_lock_mode") === 1 ? "inventory" : result.get("item_lock_mode") === 0 ? "none" : "slot");
			item.keepOnDeath = result.get("item_keep_on_death");

			switch (result.get("item_editOptions")) {
				case 1:
					new ListUI({
						title: "物品可放置于方块",
						mode: 1,
						itemStack: item,
						items: item.getCanPlaceOn(),
						nextUI: ItemEditGUI,
						maxLine: Infinity,
						lineMaxLength: 30
					}).sendToPlayer(player);
					return;
					break;
				case 2:
					new ListUI({
						title: "物品可破坏方块",
						mode: 2,
						itemStack: item,
						items: item.getCanDestroy(),
						nextUI: ItemEditGUI,
						maxLine: Infinity,
						lineMaxLength: 30
					}).sendToPlayer(player);
					return;
					break;
				case 3:
					new ListUI({
						title: "物品展示属性",
						mode: 3,
						itemStack: item,
						items: item.getLore(),
						nextUI: ItemEditGUI,
						maxLine: 15,
						lineMaxLength: 45
					}).sendToPlayer(player);
					return;
					break;
				case 4: 
					new ComponentListUI({
						itemStack: item,
						nextUI: ItemEditGUI
					}).sendToPlayer(player);
					return;
			};

			if (result.get("item_save")) {
				if(!result.get("item_drop")){
					equipItemComp.setEquipment("Mainhand", item);
				} else {
					let dropLoc = {...player.location};
					dropLoc.y = dropLoc.y - 1;
					let itemEntity = player.dimension.spawnItem(item, dropLoc);
					itemEntity.clearVelocity();
				};
				return;
			};
			new ItemEditGUI(player, {
				itemStack: item.clone()
			}).sendToPlayer(player);
		});
	}
};

mc.system.run(() => {
	UIManager.addUI(ItemEditGUI);
});

class ListUI extends ScriptUI.ActionFormData {
	constructor(showData) {
		super();
		this.setTitle(showData.title);
		this.addButton({
			buttonDef: {
				text: "保存"
			},
			event: (player) => {
				new showData.nextUI(player, showData).sendToPlayer(player);
			}
		});
		if (showData.items.length < showData.maxLine) {
			this.addButton({
				buttonDef: {
					text: "添加"
				},
				event: (player) => {
					new AddItemUI(showData).sendToPlayer(player);
				}
			});
		};
		for (let itemIndex = 0; itemIndex < showData.items.length; itemIndex++) {
			this.addButton({
				buttonDef: {
					text: showData.items[itemIndex]
				},
				event: (player) => {
					showData.items.splice(itemIndex, 1);
					new ListUI(showData).sendToPlayer(player);
				}
			});
		};
	};
};


/*class ComponentListUI extends ScriptUI.ActionFormData {
	constructor(showData){
		this.setTitle("物品组件编辑（仅API提供的）");
		for(let component of showData.itemStack.getComponents()){
			this.addButton({
				buttonDef: {
					text: component.componentId
				},
				event: (player)=>{
					new ComponentView(component, showData).sendToPlayer(player);
				}
			});
		}
	}
};

class ComponentView extends ScriptUI.ModalFormData {
	
}*/

class AddItemUI extends ScriptUI.ModalFormData {
	constructor(data) {
		super();
		this.setTitle("添加");
		this.setFather(new ListUI(data));
		this.setButtonsArray([{
			typeId: "textField",
			label: `最大容量：${data.lineMaxLength} 个字符`,
			id: "edit_input",
			setting: {}
		}]);
		this.setEvents((player, res) => {
			let str = res.get("edit_input");
			if (str.length <= data.lineMaxLength) {
				data.items.push(str);
			} else {
				player.sendMessage("字符串过长");
			};
			new ListUI(data).sendToPlayer(player);
		});
	}
}