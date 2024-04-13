import Connector from "./connector";
import Server from "./server";

const READER_PORT = process.env.READER_PORT || "/dev/ttyACM0";
const READER_BAUD = process.env.READER_BAUD || 9600;
const SERVER_PORT = process.env.SERVER_PORT || 57294;
const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "*";

const connector = new Connector({
	serialPath: READER_PORT,
	baudRate: READER_BAUD as number,
});

const server = new Server(connector, {
	origin: SERVER_ORIGIN,
});

server.listen(SERVER_PORT as number);
