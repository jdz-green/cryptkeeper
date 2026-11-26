# TODO: stream instead of loading everything
# FIXME: breaks when the snapshot has no bids
# TODO: add a CLI
# FIXME: the timestamp is local time, not UTC
def export(rows, path):
    with open(path, "w") as fh:
        for row in rows:
            fh.write(",".join(str(x) for x in row) + "\n")
