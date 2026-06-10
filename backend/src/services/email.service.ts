import net from "net";
import tls from "tls";

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
}

const escapeSmtp = (value: string) => value.replace(/\r?\n/g, " ");

class EmailService {
    private async sendCommand(socket: net.Socket | tls.TLSSocket, command: string, expectedCodes: string[]): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const onData = (data: Buffer) => {
                const response = data.toString();
                const code = response.slice(0, 3);
                socket.off("error", onError);
                if (expectedCodes.includes(code)) {
                    resolve();
                } else {
                    reject(new Error(`SMTP error after ${command}: ${response}`));
                }
            };
            const onError = (error: Error) => {
                socket.off("data", onData);
                reject(error);
            };
            socket.once("data", onData);
            socket.once("error", onError);
            socket.write(`${command}\r\n`);
        });
    }

    private async waitGreeting(socket: net.Socket | tls.TLSSocket): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const onData = (data: Buffer) => {
                const code = data.toString().slice(0, 3);
                socket.off("error", onError);
                code === "220" ? resolve() : reject(new Error(data.toString()));
            };
            const onError = (error: Error) => {
                socket.off("data", onData);
                reject(error);
            };
            socket.once("data", onData);
            socket.once("error", onError);
        });
    }

    async sendMail(options: MailOptions): Promise<void> {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            console.log("Email non envoye: configuration SMTP manquante", options);
            return;
        }

        const secure = process.env.SMTP_SECURE === "true" || port === 465;
        const socket = secure
            ? tls.connect(port, host, { servername: host })
            : net.connect(port, host);

        try {
            await this.waitGreeting(socket);
            await this.sendCommand(socket, `EHLO ${process.env.SMTP_DOMAIN || "hadipharma.local"}`, ["250"]);
            await this.sendCommand(socket, "AUTH LOGIN", ["334"]);
            await this.sendCommand(socket, Buffer.from(user).toString("base64"), ["334"]);
            await this.sendCommand(socket, Buffer.from(pass).toString("base64"), ["235"]);
            await this.sendCommand(socket, `MAIL FROM:<${escapeSmtp(options.from)}>`, ["250"]);
            await this.sendCommand(socket, `RCPT TO:<${escapeSmtp(options.to)}>`, ["250", "251"]);
            await this.sendCommand(socket, "DATA", ["354"]);

            const message = [
                `From: ${escapeSmtp(options.from)}`,
                `To: ${escapeSmtp(options.to)}`,
                `Subject: ${escapeSmtp(options.subject)}`,
                "MIME-Version: 1.0",
                "Content-Type: text/plain; charset=utf-8",
                "",
                options.text,
                "."
            ].join("\r\n");

            await this.sendCommand(socket, message, ["250"]);
            await this.sendCommand(socket, "QUIT", ["221"]);
        } finally {
            socket.end();
        }
    }
}

export default new EmailService();
