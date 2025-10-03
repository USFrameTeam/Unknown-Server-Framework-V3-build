package com.USFTeam.neoUSF;
import java.io.*;
import java.util.*;
import com.USFTeam.neoUSF.logServer.*;
import org.json.*;
import java.nio.file.*;
import java.nio.charset.*;

public class Main {
	private static boolean STARTLOG = false;
	private static int PORT = 1024;
	private static String ADDRESS = "127.0.0.1";
	public static void main(String[] args) {
		System.out.println("----USF-Loader----");
		System.out.println("----读取配置文件&检测USF----");
		//文件检测
		Properties mc_prop = new Properties();
		File usf_json = new File("./usf_config.json");
		File mc_prop_file = new File("./server.properties");

		if (!usf_json.exists() || !mc_prop_file.exists()) {
			System.out.println("[error]usf_config.json或server.properties文件不存在");
			return;
		} ;
		try {
			//解析json/property
			String usfJsonStr = new String(Files.readAllBytes(Paths.get(usf_json.getPath())), StandardCharsets.UTF_8);
			JSONObject logServerSetting = new JSONObject(usfJsonStr).getJSONObject("logServer");
			STARTLOG = logServerSetting.getBoolean("run");
			ADDRESS = logServerSetting.getString("logAddress");
			PORT = logServerSetting.getInt("port");
			mc_prop.load(new FileInputStream(mc_prop_file));

			String saveFileName = mc_prop.getProperty("level-name");
			File save_path = new File("./worlds/" + saveFileName);
			if (!(new File(save_path.getPath() + "/world_behavior_packs.json").exists())) {
				new File(save_path.getPath() + "/world_behavior_packs.json").createNewFile();
			}
			FileInputStream wbh = new FileInputStream(save_path.getPath() + "/world_behavior_packs.json");
			String wbhJsonStr = new String(
					Files.readAllBytes(Paths.get(save_path.getPath() + "/world_behavior_packs.json")),
					StandardCharsets.UTF_8);
			JSONArray bh_list = new JSONArray(wbhJsonStr);
			boolean noUSF = true;
			for (int index = 0; index < bh_list.length(); index++) {
				if (bh_list.getJSONObject(index).getString("pack_id").equals("270ce464-c538-4ecc-bd24-52343b65b224")) {
					noUSF = false;
					break;
				}
			} ;
			if (noUSF) {
				bh_list.put(new JSONObject().put("pack_id", "270ce464-c538-4ecc-bd24-52343b65b224").put("version", new JSONArray().put(1).put(0).put(0)));
				Files.write(Paths.get(save_path.getPath() + "/world_behavior_packs.json"),
						bh_list.toString().getBytes(StandardCharsets.UTF_8), StandardOpenOption.WRITE);
				//检测USF文件并判断是否下载
			} ;

		} catch (Exception e) {
			e.printStackTrace();
		} ;
		System.out.println("----USF加载成功----");
		if (STARTLOG) {
			logServer.launch(PORT);
			System.out.println("输入quit结束日志服务器");
			System.out.println("tip:这个程序一关日志服务器就没了，作者不会写后台运行，你用命令改后台吧");
			while (true) {
				//System.out.println("test");
				if (new Scanner(System.in).next().equals("quit")) {
					break;
				};
			};
			logServer.close_server();
			System.out.println("finish");
		}
	}
}

