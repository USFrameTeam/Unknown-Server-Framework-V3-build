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
			maxNumber: 5
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
	//只能改大，改小后会有bug
	LandSizeMax: 1024
}