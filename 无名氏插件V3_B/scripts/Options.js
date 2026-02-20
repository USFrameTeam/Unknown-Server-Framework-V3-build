export const DefaultOptions = {
	openMainItemList: [
		"minecraft:clock"
	],
	chatSettings: {
		enable: true,
		defaultHeader: "§b[/dimensionID]/name: /message"
		//filterEnable: true
	},
	teleportOptions: {
		enable: true,
		personal: {
			enable: true,
			maxNumber: 20
		},
		world: {
			enable: true,
			onlyOpCanEdit: true,
			maxNumber: 5
		},
		random: {
			enable: true,
			distance: 10000
		},
		playerTp: {
			enable: true
		}
	},
	landOptions: {
		enable: true,
		cost: 1,
		personal: {
			maxNumber: 10
		}
	}
};
//只能修改文件
export const HardCode = {
	land: {
		LandSizeMax: 256,
		permissions: {
			"placeBlock": "放置方块",
			"breakBlock": "破坏方块",
			"interactWithEntity": "与实体交互",
			"interactWithBlock": "与方块交互",
			"attackEntity": "攻击实体"
		}
	}
}