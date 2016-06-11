# This is a python script that generates a txt file of fake email addresses
# The list will be 100,000 email addresses, and will also contain 50% duplicates

# Running this script will output two files:
# emails.txt is the full 100,000 list of emails
# deduped.txt is the ordered, deduplicated list of emails

# you can use some simple tools to validate this scripts behavior i.e.
# http://textmechanic.com/text-tools/basic-text-tools/remove-duplicate-lines/

import random, string

# helper function to produce random email name
all_chars = string.ascii_letters + string.digits
def randomEmail():
    rand_len = random.randint(5, 15)
    return ''.join(random.choice(all_chars) for i in range(rand_len))

# fixed number of domain names here; could also make these completely random
unique_emails = []
# modify this list to add/remove domain names
domains = ["gmail.com", "yahoo.com", "yahoo.net", "hotmail.org", "uw.edu", "hello.world", "cs.uw.edu"]
while len(unique_emails) < 50000:
    curr_name = randomEmail()
    # 1st line: generate emails for the given domain names; 2nd line: generate emails with random .com domain names
    curr_email = curr_name + "@" + domains[random.randint(0, len(domains) - 1)]
    #curr_email = curr_name + "@" + randomEmail() + ".com"
    if curr_email not in unique_emails:
        unique_emails.append(curr_email)

# insert 50,000 duplicates at random; keep track of number of duplicates
all_emails = list(unique_emails)
duped = {}
for x in range(0, 50000):
    duped_email = unique_emails[random.randint(0, len(unique_emails) - 1)]
    all_emails.insert(random.randint(0, len(all_emails)), duped_email)
    if duped_email in duped:
        duped[duped_email] += 1
    else:
        duped[duped_email] = 1

# write the complete email list out to txt file
# write the expected, ordered, de-duped email list
with open("emails.txt", "wt") as full_list, open("deduped.txt", "wt") as deduped_list:
    for email in all_emails:
        full_list.write(email + "\n")
        if email in unique_emails:
            deduped_list.write(email +"\n")
            unique_emails.remove(email)
