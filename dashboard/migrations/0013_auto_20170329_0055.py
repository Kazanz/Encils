# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-29 00:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0012_teacher_active_classroom'),
    ]

    operations = [
        migrations.RenameField(
            model_name='answer',
            old_name='rank',
            new_name='grade',
        ),
    ]
