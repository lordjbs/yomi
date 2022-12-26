from .. import db

def getBook(bookId: str):
    return db.book.find_first(
        where={
            "id": bookId,
        },
        include={
            "Series": True,
        }
    )

# TODO: Actual validation?
def updateBook(bookId: str, data: dict):
    return db.book.update(
        where={
            "id": bookId,
        },
        data=data,
    )

def nextVolume(id: str):
    book = db.book.find_first(
        where={
            "id": id
        },
        include={
            "Series": True,
        }
    )
    if not book: return None

    series = db.series.find_first(
        where={
            "id": book.Series.id,
        },
        include={
            "books": True,
        }
    )

    if not series or not series.books: return None
    