import config from "./repos.json";

async function getRepos() {
    console.log("Fetching data from github...");

    const OPTIONS = import.meta.env.GITHUB_API
        ? {
              headers: {
                  Authorization: `Bearer ${import.meta.env.GITHUB_API}`,
              },
          }
        : {};

    const res = await fetch(
        "https://api.github.com/users/jaanonim/repos?per_page=100",
        OPTIONS
    );
    const default_data = await res.json();

    const included = await Promise.all(
        config.include.map((path) => {
            return (async () => {
                const res = await fetch(
                    `https://api.github.com/repos/${path}`,
                    OPTIONS
                );
                return await res.json();
            })();
        })
    );
    let data = [...default_data, ...included];

    data = data.filter(
        (ele) => !config.exclude.some((n) => n === ele.full_name)
    );

    for (const [key, value] of Object.entries(config.overwrite)) {
        data = data.map((ele) => {
            if (ele.full_name == key) {
                return { ...ele, ...value };
            }
            return ele;
        });
    }

    data = data.sort((a, b) => {
        return (
            new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        );
    });

    return data;
}

const REPOS = getRepos();

export async function getAllRepos() {
    return REPOS;
}

export async function getTopRepos() {
    return (await REPOS)
        .filter((ele) => config.top.some((n) => n === ele.full_name))
        .slice(0, 3);
}

export function getLanguages(repos: any[]) {
    let langs = {};
    repos.forEach((repo) => {
        langs[repo.language] = 1;
    });
    return Object.keys(langs);
}
