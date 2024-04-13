import Connector from "./connector";
import Server from "./server";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const READER_PORT = process.env.READER_PORT || "/dev/ttyUSB0";
const READER_BAUD = parseInt(process.env.READER_BAUD ?? "9600");
const SERVER_PORT = parseInt(process.env.SERVER_PORT ?? "57294");
const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "*";

const connector = new Connector({
	serialPath: READER_PORT,
	baudRate: READER_BAUD,
});

const server = new Server(connector, {
	origin: SERVER_ORIGIN,
});

server.listen(SERVER_PORT);
