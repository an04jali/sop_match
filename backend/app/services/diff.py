import difflib


class TextDiff:

    def compare(self, original: str, revised: str):

        original_words = original.split()
        revised_words = revised.split()

        matcher = difflib.SequenceMatcher(
            None,
            original_words,
            revised_words
        )

        changes = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():

            if tag == "equal":

                for word in original_words[i1:i2]:
                    changes.append({
                        "type": "unchanged",
                        "word": word
                    })

            elif tag == "delete":

                for word in original_words[i1:i2]:
                    changes.append({
                        "type": "removed",
                        "word": word
                    })

            elif tag == "insert":

                for word in revised_words[j1:j2]:
                    changes.append({
                        "type": "added",
                        "word": word
                    })

            elif tag == "replace":

                for word in original_words[i1:i2]:
                    changes.append({
                        "type": "removed",
                        "word": word
                    })

                for word in revised_words[j1:j2]:
                    changes.append({
                        "type": "added",
                        "word": word
                    })

        return changes