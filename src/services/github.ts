import config from "./repos.json";

async function getRepos() {
    console.log("Fetching data from github...");

    const OPTIONS = {
        headers: {
            Authorization: `Bearer ${import.meta.env.GITHUB_API}`,
        },
    };

    const res = await fetch(
        "https://api.github.com/users/jaanonim/repos",
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

    data = data.filter((ele) => !config.exclude.some((n) => n == ele.name));

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
    return (await REPOS).slice(0, 3);
}
