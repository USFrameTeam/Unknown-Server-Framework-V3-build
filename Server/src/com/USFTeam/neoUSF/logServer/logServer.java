package com.usfteam.neousf.logserver;
import com.usfteam.neousf.*;
import java.io.*;
import java.net.*;
import java.nio.charset.*;
import java.nio.file.*;
import java.util.concurrent.*;
import org.json.*;

//此程序依靠bug运行[doge]

public class logServer {
	public static boolean ThreadExit = false;
	private static ServerSocket server = null;
	private static ExecutorService tpool = null;
	private static final String sendLog = "HTTP/1.1 200 OK\r\n\r\nNeoUSF\r\n\r\n";
	private logServer() {
	};
	public static void launch(final int POST) {
		try {
			System.out.println("已启动日志服务器");
			tpool = Executors.newFixedThreadPool(10);
			server = new ServerSocket(POST);
			while (!ThreadExit) {
				final Socket clientSocket = server.accept();

				tpool.submit(new Runnable() {

					@Override
					public void run() {
						//							try
						//							{
						//System.out.println("receive");
						acceptClient(clientSocket);
						//							}
						//							catch (IOException e)
						//							{
						//								e.printStackTrace();
						//							}	
					}
				});
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	};

	private static void acceptClient(Socket client) {
		InputStream input = null;
		OutputStream output = null;
		try {
			input = client.getInputStream();
			output = client.getOutputStream();
			//System.out.println();
			int times = 0;
			synchronized (new Object()) {
				while ((input.available() == 0) && (times < 10)) {
					times++;
					Thread.sleep(500);
				} ;
			}
			byte[] byteContainer = new byte[input.available() + 3];
			input.read(byteContainer);
			String inputInfo[] = new String(byteContainer, StandardCharsets.UTF_8).split("\n");
			for (int infoIndex = 0; infoIndex < inputInfo.length; infoIndex++) {
				if (!(inputInfo[infoIndex].indexOf("neousf") == -1)) {
					//System.out.println("handle");
					handle(inputInfo[infoIndex].substring(7));
					break;
				}
			} ;
			output.write(sendLog.getBytes());
			input.close();
			output.close();
			//System.out.println("end");
		} catch (Exception e) {
			e.printStackTrace();
		}
	};
	//字符串转json并处理
	private static void handle(String jsonData) {
		try {
			JSONObject json = new JSONObject(jsonData);
			if (json.getString("type").equals("Log")) {
				File logFile = new File(Main.JarPath + "/logs/" + json.getString("filePath"));
				File logName = new File(logFile.getPath() + "/" + json.getString("fileName"));
				if (!logFile.exists()) {
					logFile.mkdirs();
				} ;
				//System.out.println(logFile.getAbsolutePath());
				try {
					if (!(new File(logName.getPath()).exists())) {
						new File(logName.getPath()).createNewFile();
					}
					Files.write(Paths.get(logName.getPath()), (json.getString("data") + "\n").getBytes(),
							StandardOpenOption.APPEND);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			/*if (json.getString("type").equals("Message")) {
				
			}*/
		} catch (Exception e) {
			e.printStackTrace();
		}
	};
	public static void close_server() {
		try {
			ThreadExit = true;
			System.out.println("shutdown");
			tpool.shutdownNow();
			System.out.println("close server");
			logServer.server.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
};

