import {
	ScriptUI
} from "../../utils/UIAPI.js";
import {
	UIManager
} from "../init.js";
import {
  USFPlayer
} from "../utils/PlayerAPI.js";
import * as mc from "@minecraft/server";

mc.system.run(() => {
  UIManager.addUI(LandGUI);
});

class ShopInterface extends {
	
}