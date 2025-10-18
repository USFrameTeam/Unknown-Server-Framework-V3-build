package com.usfteam.neousf;
import com.usfteam.neousf.logserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.*;
import java.nio.file.*;
import java.util.*;
import org.json.*;
import io.commandwither.nbtedit.*;

public class Main {
	private static boolean STARTLOG = false;
	private static int PORT = 1024;
	private static String ADDRESS = "127.0.0.1";
	public static String JarPath;
	public static JSONArray neoUSFVersion = new JSONArray();
	private Main(){};
	public static void main(String[] args) {
		System.out.println("----NeoUSF-Loader v1.0.0----");
		final Scanner userInput = new Scanner(System.in);
		JarPath = URLDecoder.decode(new File(Main.class.getProtectionDomain().getCodeSource().getLocation().getPath()).getParent(), StandardCharsets.UTF_8);
		System.out.println("----读取配置文件&检测USF----");
		//文件检测
		System.out.println("jar文件目录路径：" + JarPath);
		Properties mc_prop = new Properties();
		File usf_json = new File(JarPath + "/neousf_config.json");
		File mc_prop_file = new File(JarPath + "/server.properties");

		if (!usf_json.exists() || !mc_prop_file.exists()) {
			System.out.println("[error]neousf_config.json或server.properties文件不存在");
			return;
		} ;
		try {
			//解析json/property
			//解析neousf_config.json
			String usfJsonStr = new String(Files.readAllBytes(Paths.get(usf_json.getPath())), StandardCharsets.UTF_8).replaceAll("(?s)(//.*?$)|(/\\*.*?\\*/)", "");
			JSONObject logServerSetting = new JSONObject(usfJsonStr).getJSONObject("logServer");
			STARTLOG = logServerSetting.getBoolean("run");
			ADDRESS = logServerSetting.getString("logAddress");
			PORT = logServerSetting.getInt("port");
			//获取存档
			mc_prop.load(new FileInputStream(mc_prop_file));
			String saveFileName = mc_prop.getProperty("level-name");
			File save_path = new File(JarPath + "/worlds/" + saveFileName);
			if (!(new File(save_path.getPath() + "/world_behavior_packs.json").exists())) {
				new File(save_path.getPath() + "/world_behavior_packs.json").createNewFile();
			};
			File mc_levelDat = new File(save_path.getPath() + "/level.dat");
			if(!save_path.exists() && !mc_levelDat.exists()){
				System.out.println("存档不存在");
				return;
			};
			
			//存档行为包文件夹创建
			if(new File(save_path.getPath() + "/behavior_packs/").exists() == false){
				new File(save_path.getPath() + "/behavior_packs/").mkdirs();
			};
			
			File neoUsfBehPack = new File(save_path.getPath() + "/behavior_packs/NeoUSF/");
			//获取mc版本
			NBTReader levelReader = new NBTReader(new File(save_path.getPath() + "/level.dat"));
			levelReader.skip(8);
			JSONObject leveldata = new JSONObject(levelReader.readAsJSON());
			JSONArray mcVersion = leveldata.getJSONArray("MinimumCompatibleClientVersion");
			
			//检测NeoUSF包
			boolean hasNeoUSFPack = false;
			JSONObject NeoUSFManifest = NeoUSFPack.getManifestFromPacks(save_path.getPath() + "/behavior_packs");
			if(NeoUSFManifest != null){
				hasNeoUSFPack = true;
				neoUSFVersion = NeoUSFManifest.getJSONObject("header").getJSONArray("version");
			};
			
			System.out.println("mc版本：" + mcVersion.toString());
			if(!hasNeoUSFPack){
				System.out.println("检测到没有NeoUSF，是否下载NeoUSF[y/n]");
				if(userInput.next().equals("y")){
					NeoUSFDownload.launch(new int[]{mcVersion.getInt(0), mcVersion.getInt(1), mcVersion.getInt(2)}, neoUsfBehPack.getPath());
				} else {
					System.out.println("退出");
					return;
				}
				
			} else {
				System.out.println("NeoUSF版本：" + neoUSFVersion.toString());
				System.out.println("是否检测NeoUSF版本？[y/n]");
				if(userInput.next().equals("y")){JSONArray netNeoUSFVersion = NeoUSFDownload.getVersion(new int[]{mcVersion.getInt(0), mcVersion.getInt(1), mcVersion.getInt(2)}).getJSONArray("version");
				if(neoUSFVersion.toString().equals(netNeoUSFVersion.toString())){
					System.out.println("已是最新版本");
				} else {
					System.out.println("下载新版本");
					NeoUSFDownload.launch(new int[]{mcVersion.getInt(0), mcVersion.getInt(1), mcVersion.getInt(2)}, neoUsfBehPack.getPath());
				}}
			};
			
			//检测目前NeoUSF版本
			NeoUSFManifest = NeoUSFPack.getManifestFromPacks(save_path.getPath() + "/behavior_packs");
			if(NeoUSFManifest == null){
				System.out.println("读取NeoUSF失败");
				return;
			};
			neoUSFVersion = NeoUSFManifest.getJSONObject("header").getJSONArray("version");
			//world_behavior_pack.json处理
			FileInputStream wbh = new FileInputStream(save_path.getPath() + "/world_behavior_packs.json");
			String wbhJsonStr = new String(
					Files.readAllBytes(Paths.get(save_path.getPath() + "/world_behavior_packs.json")),
					StandardCharsets.UTF_8);
			if(wbhJsonStr.length() == 0){
				wbhJsonStr = "[]";
			}
			JSONArray bh_list = new JSONArray(wbhJsonStr);
			boolean noUSF = true;
			for (int index = 0; index < bh_list.length(); index++) {
				if (bh_list.getJSONObject(index).getString("pack_id").equals("270ce464-c538-4ecc-bd24-52343b65b224")) {
					if(!bh_list.getJSONObject(index).getJSONArray("version").toString().equals(neoUSFVersion.toString())){
						bh_list.getJSONObject(index).put("version", neoUSFVersion);
					}
					noUSF = false;
					break;
				}
			} ;
			if (noUSF) {
				bh_list.put(new JSONObject().put("pack_id", "270ce464-c538-4ecc-bd24-52343b65b224").put("version", neoUSFVersion));
			} ;
			Files.write(Paths.get(save_path.getPath() + "/world_behavior_packs.json"),
									bh_list.toString().getBytes(StandardCharsets.UTF_8), StandardOpenOption.WRITE);
			{
				File apiPermissions = new File(JarPath + "/config/default/permissions.json");
				if(!apiPermissions.exists()){
					apiPermissions.createNewFile();
					Files.write(Paths.get(apiPermissions.getPath()), "{}".getBytes());
				};
				byte[] permissionByte = Files.readAllBytes(Paths.get(apiPermissions.getPath()));
				JSONArray permissionAllowed = new JSONObject(new String(permissionByte, StandardCharsets.UTF_8)).getJSONArray("allowed_modules");
				for(int NeoUSFPIndex = 0; NeoUSFPIndex < Options.apiPermissions.length; NeoUSFPIndex++){
					boolean noPermission = true;
					for(int jsonIndex = 0; jsonIndex < permissionAllowed.length();jsonIndex++){
						if(permissionAllowed.getString(jsonIndex).equals(Options.apiPermissions[NeoUSFPIndex])){
							noPermission = false;
						}
					};
					if(noPermission){
						permissionAllowed.put(Options.apiPermissions[NeoUSFPIndex]);
					};
				};
				JSONObject permissionJSON = new JSONObject();
				permissionJSON.put("allowed_modules", permissionAllowed);
				Files.write(Paths.get(apiPermissions.getPath()), permissionJSON.toString().getBytes(StandardCharsets.UTF_8), StandardOpenOption.WRITE);
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println("异常");
			return;
		} ;
		System.out.println("----NeoUSF加载成功----");
		if (STARTLOG) {
			(new Thread(){
				public void run(){
					System.out.println("输入quit结束日志服务器\ntip:这个程序一关日志服务器就没了，作者不会写后台运行，你用命令改后台吧");
					while(true){
						if(userInput.next().equals("quit")){
							logServer.close_server();
							break;
						}
					}
				}
			}).start();
			logServer.launch(PORT);
		}
	};
}

