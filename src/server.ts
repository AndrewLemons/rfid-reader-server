import { Server as SocketServer } from "socket.io";
import Connector from "./connector";

export default class Server {
	private socket: SocketServer;
	cardScanHistory: ScanItem[] = [];

	constructor(connector: Connector, options: ServerOptions = {}) {
		this.socket = new SocketServer({
			cors: {
				origin: options.origin || "*",
			},
		});

		connector.on("cardScan", this.handleCardScan.bind(this));

		this.socket.on("connection", (socket) => {
			socket.on("card_scan_history", () => {
				socket.emit("card_scan_history", JSON.stringify(this.cardScanHistory));
				console.log("card_scan_history:", JSON.stringify(this.cardScanHistory));
			});
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
		this.socket.emit("card_scan", JSON.stringify(cardScan));
		console.log("card_scan:", JSON.stringify(cardScan));
	}

	/**
	 * Listen for incoming connections.
	 * @param port - Port to listen on.
	 */
	listen(port: number = 57294) {
		this.socket.listen(port);
	}
}

interface ServerOptions {
	origin?: string;
}

interface ScanItem {
	data: string;
	timestamp: number;
}
