import WebSocket, { Server as WebSocketServer } from "ws";
import Connector from "./connector";

export default class Server {
	private wss: WebSocketServer;
	cardScanHistory: ScanItem[] = [];

	constructor(connector: Connector, options: ServerOptions = {}) {
		this.wss = new WebSocketServer({ port: options.port || 57294 });

		connector.on("cardScan", this.handleCardScan.bind(this));

		this.wss.on("connection", (ws) => {
			ws.on("message", (message) => {
				if (message.toString() === "card_scan_history") {
					ws.send(JSON.stringify(this.cardScanHistory));
					console.log(
						"card_scan_history:",
						JSON.stringify(this.cardScanHistory),
					);
				}
			});
		});
	}

	/**
	 * Start the server.
	 */
	public listen() {
		this.wss.on("listening", () => {
			console.log("Server started on port", this.wss.options.port);
		});
	}

	/**
	 * Handle card scan event.
	 * @param data - Card data.
	 */
	public handleCardScan(data: string) {
		const timestamp = Date.now();
		let cardScan = { data, timestamp };
		this.cardScanHistory.push(cardScan);

		// Remove old scans.
		this.cardScanHistory = this.cardScanHistory.filter((scan, index) => {
			// Keep the last 10 scans and any scans within the last minute.
			return (
				index >= this.cardScanHistory.length - 10 ||
				scan.timestamp > timestamp - 60000
			);
		});

		// Emit scan to clients.
		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({ event: "card_scan", data: cardScan }));
			}
		});
		console.log("card_scan:", JSON.stringify(cardScan));
	}
}

interface ServerOptions {
	port?: number;
}

interface ScanItem {
	data: string;
	timestamp: number;
}
