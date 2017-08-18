from datetime import datetime

from django.contrib.auth.models import AbstractUser
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
    RegexValidator,
)
from django.db import models

from sms.manager import TeacherManager


PHONE_REGEX = RegexValidator(
    regex=r'^\d{11,16}$',
    message="Phone number must be entered in the format: '999999999'. Up to 16 digits allowed."
)

ATTENDANCE_STATUS_CHOICES = (
    ("present", "present"),
    ("tardy", "tardy"),
    ("absent", "absent"),
)


class Teacher(AbstractUser):
    username = None
    email = models.EmailField(blank=True, unique=True)
    sms = models.CharField(max_length=16, validators=[PHONE_REGEX], blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = TeacherManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    @property
    def student_set(self):
        classrooms = self.classroom_set.all().values_list("pk")
        return Student.objects.filter(classroom__in=classrooms)

    @property
    def question_set(self):
        assignments = self.assignment_set.all().values_list("pk")
        return Question.objects.filter(assignment__in=assignments)

    @property
    def answer_set(self):
        questions = self.question_set.all().values_list("pk")
        return Answer.objects.filter(question__in=questions)


class Classroom(models.Model):
    teacher = models.ForeignKey(Teacher)
    name = models.CharField(max_length=50)
    school = models.CharField(max_length=50)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def assignments_given(self):
        answers = Answer.objects.filter(classroom=self).all()
        return set([answer.question.assignment.pk for answer in answers])


class Student(models.Model):
    classroom = models.ForeignKey(Classroom)
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=16, validators=[PHONE_REGEX])
    created = models.DateTimeField(auto_now_add=True)

    @property
    def teacher(self):
        return self.classroom.teacher

    @property
    def attendance(self):
        data = {}
        for attendance in self.attendance_set.all():
            data.setdefault(attendance.status, 0)
            data[attendance.status] += 1
        return data


class Attendance(models.Model):
    student = models.ForeignKey(Student)
    classroom = models.ForeignKey(Classroom)
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=7, choices=ATTENDANCE_STATUS_CHOICES, default="present")

    @property
    def teacher(self):
        return self.classroom.teacher

    @classmethod
    def attendance_today(cls, classroom):
        from sms.serializers import AttendanceSerializer
        data = []
        for student in classroom.student_set.all():
            obj, _ = Attendance.objects.get_or_create(classroom=classroom, student=student)
            data.append(AttendanceSerializer(obj).data)
        return data 


class Assignment(models.Model):
    teacher = models.ForeignKey(Teacher)
    name = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def question_count(self):
        return Question.objects.filter(assignment=self).count()


class Question(models.Model):
    assignment = models.ForeignKey(Assignment)
    text = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    @property
    def teacher(self):
        return self.assignment.teacher


class Answer(models.Model):
    student = models.ForeignKey(Student)
    question = models.ForeignKey(Question)
    classroom = models.ForeignKey(Classroom)
    text = models.CharField(max_length=160)
    grade = models.IntegerField(null=True, blank=True, validators=[MaxValueValidator(3), MinValueValidator(0)])
    created = models.DateTimeField(auto_now_add=True)

    @property
    def assignment(self):
        return self.question.assignment

    @property
    def teacher(self):
        return self.classroom.teacher


class ActiveItem(models.Model):
    teacher = models.OneToOneField(Teacher)
    classroom = models.ForeignKey(Classroom, null=True, default=None)
    question = models.ForeignKey(Question, null=True, default=None)

    def activate_classroom(self, classroom):
        if isinstance(classroom, int):
            classroom = Classroom.objects.filter(pk=classroom).first()
        self.classroom = classroom
        self.question = None
        self.save()

    def activate_question(self, question):
        if isinstance(question, int):
            question = Question.objects.filter(pk=question).first()
        self.question = question
        self.save()
