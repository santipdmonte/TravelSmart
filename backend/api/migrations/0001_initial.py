# Generated by Django 5.2.3 on 2025-06-20 13:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Day',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day_number', models.PositiveIntegerField()),
                ('date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Destination',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city_name', models.CharField(max_length=100)),
                ('country_name', models.CharField(max_length=100)),
                ('region', models.CharField(blank=True, max_length=100, null=True)),
                ('timezone', models.CharField(blank=True, max_length=50, null=True)),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Itinerary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.CharField(db_index=True, max_length=40)),
                ('details_itinerary', models.JSONField(blank=True, null=True)),
                ('trip_name', models.CharField(max_length=200)),
                ('visibility', models.CharField(choices=[('private', 'Private'), ('unlisted', 'Unlisted'), ('public', 'Public')], default='private', max_length=20)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('confirmed', 'Confirmed')], default='draft', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('activity_order', models.PositiveIntegerField()),
                ('details_activity', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('day', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='api.day')),
            ],
        ),
        migrations.CreateModel(
            name='ItineraryDestination',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('days_in_destination', models.PositiveIntegerField()),
                ('destination_order', models.PositiveIntegerField()),
                ('destination', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='api.destination')),
                ('itinerary', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destinations', to='api.itinerary')),
            ],
        ),
        migrations.AddField(
            model_name='day',
            name='itinerary_destination',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='days', to='api.itinerarydestination'),
        ),
    ]
