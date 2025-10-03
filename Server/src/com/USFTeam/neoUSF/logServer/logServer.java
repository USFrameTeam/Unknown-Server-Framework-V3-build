package com.USFTeam.neoUSF.logServer;
import java.net.*;
import java.io.*;
import java.util.concurrent.*;
import java.util.*;
import org.json.*;
import java.nio.file.*;

//此程序依靠bug运行[doge]

public class logServer {
	public static boolean ThreadExit = false;
	private static ServerSocket server = null;
	public static void launch(int post) {
		try {
			server = new ServerSocket(post);
			//ExecutorService tpool = Executors.newFixedThreadPool(3);
			//创建线程
			(new Thread() {
				@Override
				public void run() {
					while (!ThreadExit) {
						try {
							final Socket client = server.accept();
							if (client != null && !client.isClosed()) {
								acceptClient(client);
							} ;
							client.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}).start();
			System.out.println("----日志服务器已开启----");
		} catch (IOException e) {
			System.out.println(e.toString());
		}
	};

	private static void acceptClient(Socket client) throws IOException {
		InputStream input = client.getInputStream();
		OutputStream output = client.getOutputStream();

		//String inputInfo = new String(input.readAllBytes());
		//System.out.println(inputInfo);

		String[] inputInfo = new String(input.readAllBytes()).split("\n");
		for (int infoIndex = 0; infoIndex < inputInfo.length; infoIndex++) {
			if (!(inputInfo[infoIndex].indexOf("neousf") == -1)) {
				handle(inputInfo[infoIndex].substring(7));
				break;
			}
		}

		System.out.println("receive");
		//服务器信息（貌似没用）
		output.write(("HTTP/1.1 200 OK\r\nServer: USF-Log/1.0.0\r\n" + "Date: " + new Date().toString()
				+ "\r\nContent-Type: txt\r\nContent-Length: 0\r\n").getBytes());
		output.flush();
		output.close();
		input.close();
	};
	//将字符串转json并存储内容至文件
	private static void handle(String jsonData) {
		try {
			System.out.println(jsonData);
			JSONObject json = new JSONObject(jsonData);
			File logFile = new File("./logs/" + json.getString("filePath"));
			File logName = new File(logFile.getPath() + "/" + json.getString("fileName"));
			if (!logFile.exists()) {
				logFile.mkdirs();
			}
			System.out.println(logFile.getAbsolutePath());
			try {
				if (!(new File(logName.getPath()).exists())) {
					new File(logName.getPath()).createNewFile();
				}
				Files.write(Paths.get(logName.getPath()), (json.getString("data") + "\n").getBytes(), StandardOpenOption.APPEND);
			} catch (Exception e) {
				e.printStackTrace();
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	};
	public static void close_server(){
		try
		{
			ThreadExit = true;
			server.close();
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
	}
};

