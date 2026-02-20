import {
	ScriptUI
} from "../utils/UIAPI.js";
import {
	UIManager
} from "./init.js";
import {
	USFPlayer
} from "../utils/PlayerAPI.js";
import {
	Land
} from "../utils/LandAPI.js";
import {
	HardCode
} from "../Options.js";
import {
	TexturePath
} from "./TexturePath.js";
import * as mc from "@minecraft/server";

class LandGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("领地");
		this.setButtonsArray([{
			buttonDef: {
				text: "添加领地",
				iconPath: TexturePath.common.add
			},
			event: (player) => {
				player.land = {
					create: true,
					pos: []
				}
			}
		}]);
		this.setBeforeSendEvents((player) => {
			let player_land = Land.manager.getLandList({
				playerId: USFPlayer.getId(player)
			});

			for (let land of player_land) {
				this.addButton({
					buttonDef: {
						text: `${land.name}`
					},
					event: (player) => {
						new LandEditGUI(land).sendToPlayer(player);
					}
				});
			}
		});
	};
	static typeId = "LandGUI";
	static addLandGUI = () => {
		return AddLandGUI;
	};
	static managerGUI = () => {
		return LandManagerGUI;
	}
};
mc.system.run(() => {
	UIManager.addUI(LandGUI);
});


class AddLandGUI extends ScriptUI.ModalFormData {
	constructor() {
		super();
		this.setTitle("添加领地");
		this.setButtonsArray([{
				typeId: "textField",
				id: "land_name",
				label: "领地名称",
				setting: {}
			},
			{
				typeId: "textField",
				id: "land_information",
				label: "领地简介",
				setting: {}
			},
			{
				typeId: "toggle",
				id: "land_create",
				label: "确认创建",
				setting: {}
			}
		]);
		this.setBeforeSendEvents((player, ui) => {
			let data = {
				isCreate: true,
				name: "",
				information: "",
				owner: {
					id: USFPlayer.getId(player),
					name: player.name
				},
				dimension: player.dimension,
				pos: {
					from: player.land.pos[0],
					to: player.land.pos[1]
				}
			};
			let land = new Land(data);
			if (((land.pos.max.x - land.pos.min.x) >= HardCode.land.LandSizeMax) || ((land.pos.max.z - land.pos.min.z) >= HardCode.land.LandSizeMax)) {
				player.sendMessage(`领地过大，最大边长为${HardCode.land.LandSizeMax}，无法创建`);
				ui.cancel = true;
				return;
			};
			if (Land.coincide_allLand(land)) {
				player.sendMessage("领地重叠，无法创建");
				ui.cancel = true;
				return;
			}
			this.setInformation(`范围：x: ${land.pos.max.x}, y: ${land.pos.max.y}, z: ${land.pos.max.z} 到 x: ${land.pos.min.x}, y: ${land.pos.min.y}, z: ${land.pos.min.z}\n${(mc.world.getDynamicProperty("usf:land_scoreboard") === undefined ? "" : "当前花费："+ ((land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty("usf:landOptions.cost")))}`);
		});
		this.setEvents((player, results) => {
			if (results.get("land_name").length === 0) {
				player.sendMessage("领地名不能为空");
				return;
			}
			if (results.get("land_create")) {
				let data = {
					isCreate: true,
					dimension: player.dimension,
					name: results.get("land_name"),
					information: results.get("land_information"),
					owner: {
						id: USFPlayer.getId(player),
						name: player.name
					},
					pos: {
						from: player.land.pos[0],
						to: player.land.pos[1]
					}
				};
				let land = new Land(data);
				delete player.land;
				if (mc.world.getDynamicProperty("usf:land_scoreboard")) {
					let sb = mc.world.scoreboard.getObjective(mc.world.getDynamicProperty("usf:land_scoreboard"));
					if (sb === null) {
						Log.error("领地记分板不存在，id: " + mc.world.getDynamicProperty("usf:land_scoreboard"));
						return;
					};
					if ((sb.getScore(player) - ((land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty("usf:landOptions.cost"))) > 0) {
						sb.addScore(player, -(land.pos.max.x - land.pos.min.x) * (land.pos.max.y - land.pos.min.y) * (land.pos.max.z - land.pos.min.z) * mc.world.getDynamicProperty("usf:landOptions.cost"));
					} else {
						player.sendMessage("余额不足");
						return;
					}
				};
				Land.manager.addLand(land);
			}
		})
	}
};


class LandEditGUI extends ScriptUI.ModalFormData {
	constructor(land) {
		super();
		this.setTitle("领地编辑");
		this.setButtonsArray([{
				typeId: "textField",
				id: "land_name",
				label: "领地名称",
				setting: {
					defaultValue: land.name
				}
			},
			{
				typeId: "textField",
				id: "land_info",
				label: "领地信息",
				setting: {
					defaultValue: land.information
				}
			},
			{
				typeId: "toggle",
				id: "land_member",
				label: "成员设置",
				setting: {
					defaultValue: false
				}
			},
			{
				typeId: "toggle",
				id: "land_delete",
				label: "删除领地",
				setting: {
					defaultValue: false
				}
			}
		]);
		this.setBeforeSendEvents((player) => {
			this.setInformation(`领地主：${land.owner.name}\n领地id：${land.id}\n范围：${land.pos.max.x} ${land.pos.max.y} ${land.pos.max.z} - ${land.pos.min.x} ${land.pos.min.y} ${land.pos.min.z}\n信息：${land.information}`);
		});
		this.setEvents((player, res) => {
			if (res.get("land_delete")) {
				Land.manager.removeLand(land);
				return;
			} else {
				if (res.get("land_name").length === 0) {
					player.sendMessage("领地名不能为空");
					return;
				};
				land.name = res.get("land_name");
				land.info = res.get("land_info");
				land.owner.name = USFPlayer.getId(player) === land.owner.id ? player.name : land.owner.name;
				Land.manager.saveLand(land);
				if(res.get("land_member")){
					new LandMemberListGUI(land).sendToPlayer(player);
				};
			};
		});
	}
};

//领地成员设置
class LandMemberListGUI extends ScriptUI.ActionFormData {
	constructor(land){
		super();
		this.setCloseEvents((player)=>{
			new LandEditGUI(land).sendToPlayer(player);
		});
		this.setTitle("领地成员编辑");
		this.addButton({
			buttonDef: {
				text: "添加成员",
				iconPath: TexturePath.common.add
			},
			event: (player)=>{
				let playerList = new ScriptUI.ActionFormData();
				playerList.setTitle("选择玩家");
				playerList.setFather(new LandMemberListGUI(land));
				let inList = false;
				for(let other of mc.world.getAllPlayers()){
					for(let memberId in land.members){
						if(land.members[memberId]?.id === USFPlayer.getId(other)){
							inList = true;
							break;
						}
					};
					if(inList){
						continue;
					};
					playerList.addButton({
						buttonDef: {
							text: other.name
						},
						event: (player)=>{
							land.members[USFPlayer.getId(other)] = {
								name: other.name,
								id: USFPlayer.getId(other),
								permissions: {}
							};
							Land.manager.saveLand(land);
							new LandMemberListGUI(land).sendToPlayer(player);
						}
					});
				};
				playerList.sendToPlayer(player);
			}
		});
		for(let memberId in land.members){
			this.addButton({
				buttonDef: {
					text: land.members[memberId].name
				},
				event: (player)=>{
					new LandMemberEditGUI(land, memberId).sendToPlayer(player);
				}
			})
		}
	};
};



//成员权限设置
class LandMemberEditGUI extends ScriptUI.ModalFormData {
	constructor(land, memberId){
		super();
		this.setTitle("领地成员编辑");
		this.setInformation(`成员名称：${land.members[memberId].name}\n成员id: ${land.members[memberId].id}`);
		for(let permission in HardCode.land.permissions){
			this.addButton({
				typeId: "toggle",
				label: HardCode.land.permissions[permission],
				id: permission,
				setting: {
					defaultValue: !!land.members[memberId].permissions[permission]
				}
			});
		};
		this.addButton({
			typeId: "toggle",
			label: "删除成员",
			id: "member_delete",
			setting: {
				defaultValue: false
			}
		})
		this.setEvents((player, res)=>{
			if(res.get("member_delete")){
				land.members[memberId] = undefined;
				Land.manager.saveLand(land);
				return;
			};
			for(let permission in HardCode.land.permissions){
				land.members[memberId].permissions[permission] = res.get(permission);
			};
			Land.manager.saveLand(land);
		});
	}
}



//管理界面

class LandManagerGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("领地管理界面");
		this.setButtonsArray([
			{
				buttonDef: {
					text: `领地功能: ${JSON.parse(mc.world.getDynamicProperty("usf:landOptions.enable")) ? "开" : "关"}`
				},
				event: (player)=>{
					mc.world.setDynamicProperty("usf:landOptions.enable", JSON.stringify(!JSON.parse(mc.world.getDynamicProperty("usf:landOptions.enable"))));
					new LandManagerGUI().sendToPlayer(player);
				}
			},
			{
				buttonDef: {
					text: "设置领地花费"
				},
				event: (player) => {
					new LandSetCostGUI().sendToPlayer(player);
				}
			},
			{
				buttonDef: {
					text: "管理所有领地"
				},
				event: (player) => {
					new LandListGUI().sendToPlayer(player);
				}
			}
		])
	}
}


//领地花费界面
class LandSetCostGUI extends ScriptUI.ModalFormData {
	constructor() {
		super();
		this.setTitle("设置领地花费");
		this.setButtonsArray([{
				typeId: "textField",
				id: "land_sb_id",
				label: "领地记分板id（没有留空）",
				setting: {
					defaultValue: "" + (mc.world.getDynamicProperty("usf:land_scoreboard") ? mc.world.getDynamicProperty("usf:land_scoreboard") : "")
				}
			},
			{
				typeId: "textField",
				id: "land_cost",
				label: "每方块花费",
				setting: {
					defaultValue: "" + mc.world.getDynamicProperty("usf:landOptions.cost")
				}
			}
		]);
		this.setEvents((player, res) => {
			if (res.get("land_sb_id").length === 0) {
				mc.world.setDynamicProperty("usf:land_scoreboard", undefined);
			} else {
				mc.world.setDynamicProperty("usf:land_scoreboard", res.get("land_sb_id"));
			};
			if (typeof(Number(res.get("land_cost"))) !== typeof(1)) {
				return;
			} else {
				mc.world.setDynamicProperty("usf:landOptions.cost", Number(res.get("land_cost")));
			}
		})
	}
};

//领地列表
class LandListGUI extends ScriptUI.ActionFormData {
	constructor() {
		super();
		this.setTitle("领地列表");
		this.setFather(new LandManagerGUI());
		this.setBeforeSendEvents((player) => {
			let player_land = Land.manager.getLandList();
			for (let land of player_land) {
				this.addButton({
					buttonDef: {
						text: `领地名：${land.name}\n主人：${land.owner.name}`
					},
					event: (player) => {
						new LandEditGUI(land).sendToPlayer(player);
					}
				});
			}
		});
	}
}