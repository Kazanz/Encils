# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-01 20:29
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sms', '0006_assignment_question'),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=160)),
                ('grade', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MaxValueValidator(3), django.core.validators.MinValueValidator(0)])),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('classroom', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sms.Classroom')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sms.Question')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sms.Student')),
            ],
        ),
    ]
