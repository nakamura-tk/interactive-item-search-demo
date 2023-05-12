import datetime


def get_current_datetime_iso_string():
    return datetime.datetime.now(
        datetime.timezone(datetime.timedelta(hours=9))
    ).isoformat()
