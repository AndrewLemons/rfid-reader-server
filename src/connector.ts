import { EventEmitter } from "events";
import { SerialPort } from "serialport";

export default class Connector extends EventEmitter {
	private port: SerialPort;

	constructor(options: ConnectorOptions) {
		super();
		this.port = new SerialPort({
			path: options.serialPath,
			baudRate: options.baudRate || 9600,
		});
		this.port.on("data", this.onData.bind(this));
	}

	/**
	 * Handle incoming data.
	 * @param data - Incoming data.
	 */
	private onData(data: Buffer) {
		const message = data.toString("utf-8").trim();
		this.onCardScan(message);
	}

	/**
	 * Handle card scan event.
	 * @param data - Card data.
	 */
	private onCardScan(data: string) {
		this.emit("cardScan", data);
	}
}

interface ConnectorOptions {
	serialPath: string;
	baudRate?: number;
}
