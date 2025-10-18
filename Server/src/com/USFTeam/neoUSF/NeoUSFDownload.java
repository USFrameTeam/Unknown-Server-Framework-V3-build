package com.usfteam.neousf;
import com.usfteam.neousf.*;
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.zip.*;
import org.json.*;
import java.nio.file.*;

public class NeoUSFDownload {
	private NeoUSFDownload(){};
	private static JSONObject install_url = null;
	public static void launch(int[] version, String unzipPath) {
		//download("", "./updateUrl.json");
		JSONObject urls = null;
		String url;
		Scanner input = new Scanner(System.in);
		System.out.println("选项：\n1、获取下载链接\n2、输入下载链接\n[输入1/2]");
		if(input.nextInt() == 1){
			urls = getVersion(version);
			if(urls == null){
				System.out.println("未获取到NeoUSF对应版本");
				System.exit(1);
			}
			JSONArray data = urls.getJSONArray("url");
			for(int index = 0; index < urls.length(); index++){
				JSONObject urlData = data.getJSONObject(index);
				System.out.println("链接：" + urlData.getString("url"));
				System.out.println("描述：" + urlData.getString("description"));
				System.out.println("---------------------------------------");
			};
			System.out.println("选择：1-" + urls.length());
			int select = input.nextInt();
			if((select < 1) || (select > urls.length())){
				System.out.println("输入不正确");
				launch(version, unzipPath);
				return;
			};
			url = data.getJSONObject(select - 1).getString("url");
		} else {
			System.out.println("输入下载链接");
			url = input.next();
		};
		if(urls != null){
			Main.neoUSFVersion = urls.getJSONArray("version");
		}
		System.out.println("下载中（长时间下载不了为无法下载或链接不稳定）");
		download(url, Main.JarPath + "/NeoUsf.mcpack");
		System.out.println("下载完成，正在安装");
		unzip(Main.JarPath + "/NeoUsf.mcpack", unzipPath);
		File usfPack = new File(Main.JarPath + "/NeoUsf.mcpack");
		usfPack.delete();
		try
		{
			BufferedReader NeoUSFServerJSONFile = new BufferedReader(new FileReader(unzipPath + "/manifest_server.json"));
			String NeoUSFServerJSON = "";
			String JSONLine;
			while((JSONLine = NeoUSFServerJSONFile.readLine()) != null){
				NeoUSFServerJSON += JSONLine.replaceAll("(?s)(//.*?$)|(/\\*.*?\\*/)", "");
			}
		}
		catch (Exception e)
		{
			e.printStackTrace();
			System.exit(1);
		}
		System.out.println("NeoUSF安装完成");
	};
	public static JSONObject getVersion(int[] version) {
		if(install_url != null){
			return install_url;
		}
		System.out.println("获取线上版本中");
		try
		{
			URL updateJSON = new URL(Options.updateJSONUrl);
			InputStream data = updateJSON.openStream();
			InputStreamReader dataIReader = new InputStreamReader(data);
			BufferedReader reader = new BufferedReader(dataIReader);
			String jsonData = "";
			while((jsonData = reader.readLine()) != null){
				JSONObject jsonReader = new JSONObject(jsonData);
				System.out.println(jsonReader.toString());
				JSONArray mc_version = jsonReader.getJSONArray("minecraft:version");
				if(mc_version.getInt(0) == version[0] && mc_version.getInt(1) == version[1] && mc_version.getInt(2) == version[2]){
					install_url = jsonReader;
					break;
				}
			};
			reader.close();
			data.close();
			dataIReader.close();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		};
		return install_url;
	};
	
	public static void download(String url_string, String destFile_path) {
		try
		{
			URL url = new URL(url_string);
			URLConnection urlCon = url.openConnection();
			InputStream url_inputStream = urlCon.getInputStream();
			FileOutputStream destFile = new FileOutputStream(destFile_path);
			byte[] buffer = new byte[4096];
			int byteReader = 0;
			while ((byteReader = url_inputStream.read(buffer)) != -1) {
				destFile.write(buffer, 0, byteReader);
			}

			// 关闭流
			destFile.close();
			url_inputStream.close();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	};

	public static void unzip(String zipPackPath, String targerPath) {
		File targetFile = new File(targerPath);
		if (!targetFile.exists()) {
			targetFile.mkdirs();
		};
		try {
			ZipInputStream zis = new ZipInputStream(new FileInputStream(zipPackPath));
			ZipEntry zipEntry = zis.getNextEntry();
			while (zipEntry != null) {
				File newFile = new File(targetFile, zipEntry.getName());

				if (zipEntry.isDirectory()) {
					if (!newFile.isDirectory()) {
						newFile.mkdirs();
					}
				} else {
					// create all non-exists directories
					new File(newFile.getParent()).mkdirs();

					try (FileOutputStream fos = new FileOutputStream(newFile)) {
						byte[] buffer = new byte[1024];
						int length;
						while ((length = zis.read(buffer)) >= 0) {
							fos.write(buffer, 0, length);
						}
					}
				}

				zipEntry = zis.getNextEntry();
			}
			zis.closeEntry();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

