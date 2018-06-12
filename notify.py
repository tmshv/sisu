# Import smtplib for the actual sending function
import smtplib

# Import the email modules we'll need
from email.mime.text import MIMEText

class EmailService:
    def init(self, server, port, login, password):
        self.server = server
        self.port = port
        self.login = login
        self.password = password

    def get_from_email(self):
        return self.login

    def create_client(self):
        s = smtplib.SMTP_SSL(self.server, self.port)
        s.login(self.login, self.password)
        return s

    def send(self, to_emails, subject, body):
        from_email = self.get_from_email()
        to_email = ','.join(to_emails)
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        s = self.create_client()
        s.sendmail(from_email, to_emails, msg.as_string())
        s.close()

if __name__ == '__main__':
    c = {
        'server': 'smtp.yandex.ru',
        'port': 465,
        'login': 'robot@unit4.io',
        'password': 'robotUnit4'
    }
    s = EmailService()
    s.init(**c)
    s.send(['roman@tmshv.ru'], 'Test', 'hi')
