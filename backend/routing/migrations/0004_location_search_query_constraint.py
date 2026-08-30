from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routing', '0003_location'),
    ]

    operations = [
        migrations.RenameField(
            model_name='location',
            old_name='normalized_address',
            new_name='search_query',
        ),
        migrations.AlterField(
            model_name='location',
            name='search_query',
            field=models.SlugField(max_length=300),
        ),
        migrations.AddConstraint(
            model_name='location',
            constraint=models.UniqueConstraint(
                fields=('search_query', 'place_id'),
                name='unique_location_per_search_query',
            ),
        ),
    ]
