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
			maxNumber: 20
		},
		world: {
			onlyOpCanEdit: true,
			maxNumber: 5
		}
	},
	landOptions: {
		enable: true,
		cost: 1
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