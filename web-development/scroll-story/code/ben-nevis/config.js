var config = {
    style: 'mapbox://styles/branigan/cjzsvonse027m1co4nkxp13b3',
    accessToken: 'pk.eyJ1IjoibWJ4c29sdXRpb25zIiwiYSI6ImNrMm01aG9hdTBlZGwzbXQ1ZXVrNHNmejAifQ.QHQA0N6XPWddCXtvoODHZg',
    showMarkers: false,
    theme: 'light',
    alignment: 'right',
    title: 'Ben Nevis in October',
    subtitle: 'Climbing Britain\'s highest peak in Autumn 2017.',
    byline: '',
    footer: '',
    chapters: [
        {
            id: 'scotland',
            title: 'Scotland in October.',
            image: [''],
            description: `A 4,413-foot tall collapsed volcano, Ben Nevis is Great Britain\'s highest peak 
                            (<a href="https://en.wikipedia.org/wiki/Ben_Nevis" target="_blank">Wikipedia</a>). 
                            The mountain is near the town of Fort William, at the mouth of the Rivers Lochy and Nevis`,
            location: {
                center: [-4.80831, 56.35052],
                zoom: 7.92,
                pitch: 9.50,
                bearing: 0.00
            },
            onChapterEnter: [
                { layer: "route", opacity: 0 },
                { layer: 'marker', opacity: 0 },
                { layer: 'shelter', opacity: 0 }
            ],
            onChapterExit: [
                {
                    layer: 'shelter',
                    opacity: 0
                }
            ]
        },
        {
            id: 'fort-william',
            title: 'Fort William',
            image: ['https://upload.wikimedia.org/wikipedia/commons/0/09/BenNevis2005.jpg'],
            description: 'Philadelphia has XX miles of bike lanes, XX miles of which are protected. Drivers are getting more used to sharing the road, but ride defensively.',
            location: {
                center: [-4.94756, 56.80384],
                zoom: 10.64,
                pitch: 0.00,
                bearing: -0.18
            },
            onChapterEnter: [
                { layer: 'marker', opacity: 1 },
                { layer: 'route', opacity: 0 }

            ],
            onChapterExit: []
        },
        {
            id: 'ascending',
            title: 'Ascending',
            image: ['./assets/ascending.jpg'],
            description: 'Indego has been operating in Philadelphia since 20XX. The system initally was focused on Center City, but has expanded service to neighboring areas to support equitable mobility options to the city\'s residents.',
            location: {
                center: [-5.04203, 56.78770],
                zoom: 12.73,
                pitch: 0.00,
                bearing: 103.46
            },
            onChapterEnter: [
                {
                    layer: 'route',
                    opacity: 1
                }

            ],
            onChapterExit: [
                {
                    layer: 'route',
                    opacity: 0.3
                }
            ]
        },
        {
            id: 'belmont',
            title: 'The summit',
            image: ['./assets/summit-hut.jpg', './assets/backpacks.jpg'],
            description: 'A short ride along the Schuylkill River Trail from the Art Museum, Belmont is a twisty, log-ridden rollercoaster of a trail network. It is easy to get turned around, the underbrush is at times impenetrable, and short steep sections come out of nowhere. In other words, it\'s really fun',
            location: {
                center: [-5.00469, 56.79638],
                zoom: 18.11,
                pitch: 59.50,
                bearing: 94.40
            },
            onChapterEnter: [
                {
                    layer: 'shelter',
                    opacity: 0.6
                }
            ],
            onChapterExit: [
                {
                    layer: 'shelter',
                    opacity: 0
                }
            ]
        },
        {
            id: 'descent',
            title: 'A long descent',
            image: ['./assets/descending.jpg'],
            description: 'A short ride along the Schuylkill River Trail from the Art Museum, Belmont is a twisty, log-ridden rollercoaster of a trail network. It is easy to get turned around, the underbrush is at times impenetrable, and short steep sections come out of nowhere. In other words, it\'s really fun',
            location: {
                center: [-5.03447, 56.80461],
                zoom: 15.04,
                pitch: 70.00,
                bearing: 305.80
            },
            onChapterEnter: [
                {
                    layer: 'shelter',
                    opacity: 1
                },
                {
                    layer: 'route',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                    layer: 'shelter',
                    opacity: 0
                }
            ]
        },
        {
            id: 'success',
            title: 'A long descent',
            image: ['./assets/summit-marker.jpg', './assets/Ben-Nevis-3D.png'],
            description: 'A short ride along the Schuylkill River Trail from the Art Museum, Belmont is a twisty, log-ridden rollercoaster of a trail network. It is easy to get turned around, the underbrush is at times impenetrable, and short steep sections come out of nowhere. In other words, it\'s really fun',
            location: {
                center: [-5.00362, 56.79767],
                zoom: 13.0,
                pitch: 0.00,
                bearing: 0.00
            },
            onChapterEnter: [
                {
                    layer: 'shelter',
                    opacity: 1
                },
                {
                    layer: 'route',
                    opacity: 1
                }
            ],
            onChapterExit: [
                {
                    layer: 'shelter',
                    opacity: 0
                }
            ]
        }

    ]
};
