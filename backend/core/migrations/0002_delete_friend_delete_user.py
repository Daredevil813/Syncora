# Generated by Django 5.1.1 on 2024-12-02 09:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Friend',
        ),
        migrations.DeleteModel(
            name='User',
        ),
    ]
