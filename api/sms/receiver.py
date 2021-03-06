from django.conf import settings

from sms.models import Student, Teacher, Answer


class SMSMessage(object):
    def __init__(self, sms=None):
        sms = sms or SMSMessage._default()
        self.phone = sms['msisdn']
        self.text = sms['text']
        self.teacher = Teacher.objects.filter(sms=sms['to']).first()
        activeitem = getattr(self.teacher, 'activeitem', None)
        self.classroom = activeitem.classroom if activeitem else None
        self.question = activeitem.question if activeitem else None
        self.student = Student.objects.filter(
            classroom=self.classroom, phone=self.phone).first()

    def execute(self):
        if self.question and self.classroom and self.student:
            return self.create_or_update_answer()
        elif self.classroom:
            return self.create_or_update_student()

    def create_or_update_answer(self):
        answer, _ = Answer.objects.get_or_create(
            assignment=self.question.assignment,
            question=self.question,
            classroom=self.classroom,
            student=self.student, 
        )
        answer.text = self.text
        answer.save()

    def create_or_update_student(self):
        student, _ = Student.objects.get_or_create(
            classroom=self.classroom,
            phone=self.phone,
        )
        student.name = self.text
        student.save()

    @staticmethod
    def _default():
        data = {
            "keyword": "THIS",
            "msisdn": "18133893559",
            "text": "It stands for Parenthesis Mr Ulysses",
            "to": "18552436932",
            "message-timestamp": "2017-03-12 00:43:33",
            "messageId": "0B0000003B7C8DE8",
            "type": "text"
        }
        data.update(getattr(settings, 'SIMULATED_SMS', {}))
        return data 
