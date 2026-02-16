import * as mc from "@minecraft/server";
import {
	IDGenerate
} from "./API.js";
import {
	USFPlayer
} from "./PlayerAPI.js";

let TeamIdList = [];
mc.system.run(()=>{
	TeamIdList = JSON.parse(mc.world.getDynamicProperty("usf:teamList"));
})


export class Team {
	#id;
	#name;
	#members;
	#setting;
	#points;
	constructor(teamData){
		this.id = (teamData?.id === undefined ? IDGenerate() : teamData.id);
		this.name = teamData.name;
		this.members = teamData.members;
		this.setting = teamData.setting;
		this.points = teamData.points;
	};
	
	addMember(player){
		this.members.push(`${player.name}-${USFPlayer.getId(player)}`);
		let playerTeam = player.getDynamicProperty(`usf:team`);
		if(!playerTeam){
			playerTeam = [];
		} else {
			playerTeam = JSON.parse(playerTeam);
		};
		playerTeam.push(this.id);
		player.setDynamicProperty(`usf:team`, JSON.stringify(playerTeam));
		mc.world.setDynamicProperty(`usf:team.${this.id}`, JSON.stringify(this));
	};
	
	removeMember(player){
		let playerTeam = player.getDynamicProperty(`usf:team`);
		if(!playerTeam){
			playerTeam = [];
		} else {
			playerTeam = JSON.parse(playerTeam);
		};
		playerTeam.splice(playerTeam.indexOf(this.id), 1);
		player.setDynamicProperty(`usf:team`, JSON.stringify(playerTeam));
		this.members.splice(this.members.indexOf(`${player.name}-${USFPlayer.getId(player)}`), 1);
		mc.world.setDynamicProperty(`usf:team.${this.id}`, JSON.stringify(this));
	};
	
	getPoints(pointData){
		return this.points;
	};
	
	savePoints(pointData){
		this.points = pointData;
		mc.world.setDynamicProperty(`usf:team.${this.id}`, JSON.stringify(this));
	};
	
	static manager = {
		addTeam: (teamData)=>{
			let newTeam = new Team(teamData);
			TeamIdList.push(newTeam.id);
			mc.world.setDynamicProperty(`usf:team.${newTeam.id}`, JSON.stringify(newTeam));
		},
		getTeam: (id)=>{
			return mc.world.getDynamicProperty(`usf:team.${id}`);
		},
		deleteTeam: (id)=>{
			mc.world.setDynamicProperty(`usf:team.${id}`, undefined);
			TeamIdList.splice(TeamIdList.indexOf(id), 1);
		}
	};
};