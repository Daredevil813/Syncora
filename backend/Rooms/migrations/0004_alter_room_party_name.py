# Generated by Django 5.1.3 on 2024-12-03 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Rooms', '0003_remove_roomparticipant_joined_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='party_name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
