# Generated by Django 5.1.3 on 2024-12-03 10:57

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calender', '0002_alter_invite_user_alter_scheduledparty_host'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduledparty',
            name='type',
            field=models.PositiveSmallIntegerField(choices=[(1, 'Private'), (2, 'Public')], default=1, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(2)]),
        ),
    ]
