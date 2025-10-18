package com.usfteam.neousf;

import java.io.*;
import java.nio.charset.*;
import java.nio.file.*;
import org.json.*;

public class NeoUSFPack
{
	public static JSONObject getManifestFromPacks(String behaviorPacksPath) throws IOException {
		if(!new File(behaviorPacksPath).exists()){
			return null;
		}
		File behaviorPacks[] = new File(behaviorPacksPath).listFiles();
		for(int index = 0; index < behaviorPacks.length; index++){
			File manifest = new File(behaviorPacks[index].getPath() + "/manifest.json");
			if(!manifest.exists()){
				continue;
			}
			byte[] info = Files.readAllBytes(Paths.get(manifest.getPath()));
			String manifestString = new String(info, StandardCharsets.UTF_8);
			JSONObject manifestJSON = new JSONObject(manifestString);
			JSONObject manifestHeader = manifestJSON.getJSONObject("header");
			if(manifestHeader.getString("uuid").equals("270ce464-c538-4ecc-bd24-52343b65b224")){
				return manifestJSON;
			};
		};
		return null;
	}
}
