# #!/usr/bin/env python
# """Django's command-line utility for administrative tasks."""
# import os
# import sys


# def main():
#     """Run administrative tasks."""
#     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sample_back.settings')
#     try:
#         from django.core.management import execute_from_command_line
#     except ImportError as exc:
#         raise ImportError(
#             "Couldn't import Django. Are you sure it's installed and "
#             "available on your PYTHONPATH environment variable? Did you "
#             "forget to activate a virtual environment?"
#         ) from exc
#     execute_from_command_line(sys.argv)


# if __name__ == '__main__':
#     main()

#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from datetime import datetime
import time

def configure_django_settings():
    """Configure Django settings."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        import django
        django.setup()
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

def run_scheduled_task():
    """Run the scheduled task to send party reminders."""
    from calender.tasks import send_party_reminders  # Import inside function to ensure settings are configured
    while True:
        now = datetime.now()
        print(now)
        if now.hour == 13 and now.minute == 5 :
            print("in")
            send_party_reminders()
            print(f"Party reminder sent at {now.strftime('%Y-%m-%d %H:%M:%S')}")
            # Wait for a minute to avoid multiple triggers
            time.sleep(60)
        # Sleep for 30 seconds before checking again
        time.sleep(30)

def main():
    """Run administrative tasks."""
    configure_django_settings()
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'run_reminder':
        configure_django_settings()
        run_scheduled_task()
    else:
        main()
