from urllib.parse import quote_plus

# Free learning links for common skills. Keys are lowercase.
RESOURCES = {
    'python': ['https://docs.python.org/3/tutorial/', 'https://www.freecodecamp.org/learn/scientific-computing-with-python/'],
    'django': ['https://docs.djangoproject.com/en/stable/intro/tutorial01/', 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django'],
    'django rest framework': ['https://www.django-rest-framework.org/tutorial/quickstart/'],
    'postgresql': ['https://www.postgresql.org/docs/current/tutorial.html', 'https://www.postgresqltutorial.com/'],
    'sql': ['https://www.w3schools.com/sql/', 'https://sqlbolt.com/'],
    'mysql': ['https://dev.mysql.com/doc/refman/8.0/en/tutorial.html'],
    'mongodb': ['https://learn.mongodb.com/'],
    'javascript': ['https://javascript.info/', 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript'],
    'typescript': ['https://www.typescriptlang.org/docs/handbook/intro.html'],
    'react': ['https://react.dev/learn', 'https://www.freecodecamp.org/learn/front-end-development-libraries/'],
    'node.js': ['https://nodejs.org/en/learn'],
    'html': ['https://developer.mozilla.org/en-US/docs/Learn/HTML'],
    'css': ['https://developer.mozilla.org/en-US/docs/Learn/CSS'],
    'git': ['https://git-scm.com/book/en/v2', 'https://learngitbranching.js.org/'],
    'docker': ['https://docs.docker.com/get-started/'],
    'kubernetes': ['https://kubernetes.io/docs/tutorials/'],
    'aws': ['https://aws.amazon.com/getting-started/'],
    'linux': ['https://linuxjourney.com/'],
    'java': ['https://dev.java/learn/'],
    'c++': ['https://www.learncpp.com/'],
    'rest api': ['https://restfulapi.net/', 'https://www.django-rest-framework.org/tutorial/quickstart/'],
    'machine learning': ['https://www.coursera.org/learn/machine-learning', 'https://scikit-learn.org/stable/tutorial/'],
    'pandas': ['https://pandas.pydata.org/docs/getting_started/'],
    'numpy': ['https://numpy.org/doc/stable/user/absolute_beginners.html'],
}

# Rough weeks needed to reach working level (estimate only).
WEEKS = {
    'git': 1, 'html': 2, 'css': 2, 'sql': 3, 'rest api': 2,
    'python': 6, 'javascript': 6, 'java': 8, 'c++': 10,
    'django': 4, 'react': 5, 'docker': 3, 'postgresql': 3,
    'machine learning': 12, 'kubernetes': 6, 'aws': 6,
}
DEFAULT_WEEKS = 4


def get_resource_links(skill_name):
    """Return learning links for a skill. Falls back to search links."""
    key = (skill_name or '').strip().lower()
    if not key:
        return []
    if key in RESOURCES:
        return list(RESOURCES[key])
    q = quote_plus(f"learn {skill_name} tutorial")
    return [
        f"https://www.youtube.com/results?search_query={q}",
        f"https://www.google.com/search?q={q}",
    ]


def estimate_weeks(skill_name):
    return WEEKS.get((skill_name or '').strip().lower(), DEFAULT_WEEKS)
